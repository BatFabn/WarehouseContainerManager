from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from image_predict import process_image
from num_predict import process_num_inputs
from PIL import Image
import io

app = FastAPI()


class Metrics(BaseModel):
    fruit: float = Form(...),
    temperature: float = Form(...),
    humidity: float = Form(...),
    methane: float = Form(...),


def process_data(image: bytes | None, metrics: Metrics | None):
    fruit_count = "Missing input"
    fruit_status = "Missing input"
    if image:
        img = Image.open(io.BytesIO(image))
        fruit_count = process_image(img)
    if metrics and len(metrics) == 4:
        fruit_status = process_num_inputs(
            metrics["fruit"], metrics["temperature"], metrics["humidity"], metrics["methane"])

    return {"image": fruit_count, "metrics": fruit_status}


@app.post("/predict")
async def predict(
    image: Optional[UploadFile] = File(None),
    metrics: Optional[Metrics] = None
):
    image_data = None
    if image:
        image_data = await image.read()
    label = process_data(image_data, metrics)
    return label


@app.post('/sensor')
async def receive_data(request: Request):
    data = await request.json()
    result = process_data(None, {
                          "fruit": 2, "temperature": data["temperature"], "humidity": data["humidity"], "methane": data["methane"]})
    print(result["metrics"])
    print(data)
    return JSONResponse(content={"status": "success", "message": "Data received!"}, status_code=200)
