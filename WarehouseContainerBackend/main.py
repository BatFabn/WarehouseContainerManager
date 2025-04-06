from datetime import datetime, timezone
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from image_predict import process_image
from num_predict import process_num_inputs
from PIL import Image
import json
import os
import io
import redis
import smtplib
from email.message import EmailMessage

app = FastAPI()

redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_password = os.getenv("REDIS_PASSWORD")
r = redis.Redis(host=redis_host, port=redis_port,
                password=redis_password, decode_responses=True, socket_timeout=10)
try:
    r.ping()
    print("✅ Redis connection successful!")
except redis.ConnectionError as e:
    print(f"❌ Redis connection failed: {e}")


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_SENDER = os.getenv("SMTP_SENDER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


async def get_redis_publisher():
    return redis.Redis(
        host=redis_host, port=redis_port, password=redis_password, decode_responses=True, socket_timeout=10
    )


class ResponseData(BaseModel):
    fruit: str
    image: dict[str, int] | str
    metrics: dict[str, str]


class Metrics(BaseModel):
    fruit: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    methane: Optional[float] = None


async def parse_metrics(
    fruit: Optional[str] = Form(None),
    temperature: Optional[float] = Form(...),
    humidity: Optional[float] = Form(...),
    methane: Optional[float] = Form(...),
) -> Metrics:
    """Extract form-data fields and create a Metrics object."""
    return Metrics(fruit=fruit, temperature=temperature, humidity=humidity, methane=methane)


def process_data(image: bytes | None, metrics: Metrics | None):
    fruit_count = "Missing image"
    fruit_status_image = "Missing image"
    fruit_status_metrics = "Missing metrics"
    fruit_index_value = {"apple": 0, "banana": 1, "orange": 2}
    fruit_index_name = {-1: "Unknown", 0: "apple", 1: "banana", 2: "orange"}
    fruit_idx = -1 if not metrics or metrics.fruit is None else fruit_index_value.get(
        metrics.fruit, -1)

    if image:
        img = Image.open(io.BytesIO(image))
        fruit_count = process_image(img)
        if fruit_idx == -1:
            max_key = max(fruit_count, key=fruit_count.get)
            fruit_idx = fruit_index_value.get(max_key.split(
                "_")[1][:-1], -1)
        else:
            # Filter keys if fruit is specified in metrics since it must be the fruit of focus
            items = {k: v for k, v in fruit_count.items()
                     if metrics.fruit in k and v > 0}
            max_key = max(items, key=items.get) if items else None
        fruit_status_image = max_key.split(
            "_")[0] if max_key else fruit_status_image

    if metrics and None not in [metrics.temperature, metrics.humidity, metrics.methane]:
        fruit_status_metrics = "Missing metrics" if fruit_idx not in [0, 1, 2] else process_num_inputs(
            fruit_idx, metrics.temperature, metrics.humidity, metrics.methane
        )

    if fruit_status_metrics == "Early Spoilage":
        fruit_status = "Early Spoilage"
    elif fruit_status_image == "Spoiled" or fruit_status_metrics == "Spoiled":
        fruit_status = "Spoiled"
    elif fruit_status_image == "Missing image" and fruit_status_metrics == "Missing metrics":
        fruit_status = "Missing image and metrics"
    elif fruit_status_image == "Fresh" or fruit_status_metrics == "Fresh":
        fruit_status = "Fresh"
    else:
        fruit_status = "Unknown"

    return ResponseData(fruit=fruit_index_name[fruit_idx], image=fruit_count, metrics={"status": fruit_status})


@app.post("/predict", response_model=ResponseData)
async def predict(
    request: Request,
    image: UploadFile = File(None),
    fruit: Optional[str] = Form(None),
    temperature: Optional[float] = Form(None),
    humidity: Optional[float] = Form(None),
    methane: Optional[float] = Form(None)
):
    if request.headers.get("Content-Type") == "application/json":
        data = await request.json()
        metrics = Metrics(**data)  # Convert JSON to Pydantic Model
        if None in [metrics.temperature, metrics.humidity, metrics.methane]:
            metrics = Metrics(fruit=metrics.fruit) if fruit else None
    else:
        # Handle Form-data payload
        if None in [temperature, humidity, methane]:
            metrics = Metrics(fruit=fruit) if fruit else None
        else:
            metrics = Metrics(
                fruit=fruit,
                temperature=float(temperature),
                humidity=float(humidity),
                methane=float(methane)
            )

    image_data = await image.read() if image else None

    label = process_data(image_data, metrics)

    return label


@app.post("/sensor")
async def receive_data(request: Request):
    data = await request.json()
    data["timestamp"] = datetime.now(timezone.utc).isoformat()
    result = process_data(
        None,
        Metrics(
            fruit=data.get("fruit", None),
            temperature=data.get("temperature", None),
            humidity=data.get("humidity", None),
            methane=data.get("methane", None)
        ),
    )
    result = result.model_dump()
    message = {**data, **result["metrics"],
               **(result["image"] if isinstance(result["image"], dict) else {"image": result["image"]})}
    redis_pub = await get_redis_publisher()
    redis_pub.publish("sensor_data", json.dumps(message))
    redis_pub.close()

    if message["status"] in ["Early Spoilage", "Spoiled"]:
        send_spoilage_notification(data.get("email", ""), data.get(
            "fruit"), message["status"], data.get("container_id", ""), data["rack_id"], data["timestamp"])
    return JSONResponse(content={"status": "success", "message": "Data received!"}, status_code=200)


def send_spoilage_notification(to_email: str, fruit: str, status: str, container: str, rack: str, datetime: str):
    if not to_email or to_email.strip() == "":
        raise HTTPException(
            status_code=400, detail="Recipient email is empty.")
    if not container or container.strip() == "":
        raise HTTPException(status_code=400, detail="Container id is empty.")
    subject = f"⚠️ Spoilage Alert - Container #{container} Rack #{rack}"
    body = f"The system has detected that {fruit} in container #{container} and rack #{rack} is {status}. Please take necessary action."

    msg = EmailMessage()
    msg["From"] = SMTP_SENDER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_SENDER, SMTP_PASSWORD)
            server.send_message(msg)
            print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email: {e}")
