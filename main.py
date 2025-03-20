from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from fastapi import Body, FastAPI, File, UploadFile, Form, Request, WebSocket
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from image_predict import process_image
from num_predict import process_num_inputs
from PIL import Image
from typing import List
import io

app = FastAPI()


class Metrics(BaseModel):
    temperature: float
    humidity: float
    methane: float


class Image(BaseModel):
    image: Optional[UploadFile] = None


def process_data(image: bytes | None, metrics: Metrics | None):
    fruit_count = "Missing input"
    fruit_status = "Missing input"
    fruits = {"apple": 0, "banana": 1, "orange": 2}
    fruit_idx = -1
    if image:
        img = Image.open(io.BytesIO(image))
        fruit_count = process_image(img)
        max_key = max(fruit_count, key=fruit_count.get)
        fruit_idx = max_key.split("_")[1]
    if metrics:
        fruit_status = {"status": "Fresh"} if fruit_idx == -1 else process_num_inputs(
            fruits[fruit_idx], metrics["temperature"], metrics["humidity"], metrics["methane"])

    return {"image": fruit_count, "metrics": fruit_status}


@app.post("/predict")
async def predict(
    image: Optional[Image] = None,
    # metrics: Optional[dict[str, Metrics]] = None,
):
    if metrics:
        metrics = dict(dict(metrics).get('metrics', None))
    image_data = None
    # if image:
    #     image_data = await image.read()
    label = process_data(image_data, metrics)
    return label


connected_clients: List[WebSocket] = []


@app.post('/sensor')
async def receive_data(request: Request):
    data = await request.json()
    print(data)
    result = process_data(None, {
                          "fruit": 2, "temperature": data["temperature"], "humidity": data["humidity"], "methane": data["methane"]})
    print(result["metrics"])
    message = result["metrics"]

    for client in connected_clients:
        await client.send_json({**data, **message})
    return JSONResponse(content={"status": "success", "message": "Data received!"}, status_code=200)


@app.websocket("/subscribe")
async def subscribe(websocket: WebSocket):
    await websocket.accept()
    print("Client connected!")
    connected_clients.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        print(f"Connection error: {e}")
    finally:
        connected_clients.remove(websocket)
        print("Client disconnected!")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
