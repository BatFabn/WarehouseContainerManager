from typing import Optional
from fastapi import FastAPI, File, Form, UploadFile, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from image_predict import process_image
from num_predict import process_num_inputs
from PIL import Image
import json
import os
import io
import redis

app = FastAPI()

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = int(os.getenv("REDIS_PORT", 7860))
redis_password = os.getenv("REDIS_PASSWORD", None)
redis_client = redis.Redis(
    host=redis_host, port=redis_port, password=redis_password, decode_responses=True
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
        fruit_status_metrics = "Missing metrics" if fruit_idx not in list(fruit_index_value.values()) else process_num_inputs(
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
    result = process_data(
        None,
        Metrics(
            fruit=data.get("fruit", None),
            temperature=data.get("temperature", None),
            humidity=data.get("humidity", None),
            methane=data.get("methane", None)
        ),
    )

    redis_client.publish(
        "sensor_data", json.dumps(
            {**data, **result["metrics"], **result["image"]})
    )

    return JSONResponse(content={"status": "success", "message": "Data received!"}, status_code=200)
