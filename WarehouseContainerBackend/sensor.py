import asyncio
import random
import requests
import os
import cv2
import base64
from fastapi import FastAPI
from dotenv import load_dotenv

app = FastAPI()
load_dotenv()
ENDPOINT = os.getenv("WAREHOUSE_SERVER_ENDPOINT")

sensor_data = {
    "container_id": "", "rack_id": "",
    "temperature": 0.0, "humidity": 0.0, "methane": 0.0,
    "image": ""
}

sensor_lock = asyncio.Lock()
CAPTURE_INTERVAL = 10  # seconds


def capture_image_base64(cap):
    ret, frame = cap.read()
    if not ret:
        return None
    _, buffer = cv2.imencode('.jpg', frame)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    return base64_str


async def send_sensor_data():
    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        print("❌ Could not open webcam.")
        return

    print("✅ Webcam initialized. Sending sensor data...")

    try:
        while True:
            image_b64 = capture_image_base64(cap)

            async with sensor_lock:
                sensor_data["container_id"] = "3"
                sensor_data["rack_id"] = "2"
                sensor_data["temperature"] = round(random.uniform(
                    18, 21) if random.random() < 0.5 else random.uniform(27, 30), 2)
                sensor_data["humidity"] = round(random.uniform(70, 85), 2)
                sensor_data["methane"] = round(random.uniform(1.5, 3.5), 3)
                sensor_data["image"] = image_b64 or ""

                data_to_send = sensor_data.copy()

            print("📤 Posting sensor data...")
            try:
                requests.post(ENDPOINT, json=data_to_send)
            except Exception as e:
                print(f"Error sending data: {e}")

            await asyncio.sleep(CAPTURE_INTERVAL)

    finally:
        cap.release()


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(send_sensor_data())


@app.post("/sensor")
async def receive_sensor_data(data: dict):
    async with sensor_lock:
        sensor_data.update(data)
    return {"message": "Data received successfully", "data": sensor_data}


@app.get("/sensor")
async def get_sensor_data():
    async with sensor_lock:
        return sensor_data
