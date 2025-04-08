from fastapi import Request
import asyncio
import random
import requests
import os
import cv2
import base64
from fastapi import FastAPI, Request
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


async def send_sensor_data(data):
    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        print("❌ Could not open webcam.")
        return

    print("✅ Webcam initialized. Sending sensor data...")

    try:
        while True:
            image_b64 = capture_image_base64(cap)

            async with sensor_lock:
                sensor_data["email"] = "romanreigns397@gmail.com"
                sensor_data["container_id"] = "3"
                sensor_data["rack_id"] = "2"
                sensor_data["temperature"] = data.get("temperature", 0.0)
                sensor_data["humidity"] = data.get("humidity", 0.0)
                sensor_data["methane"] = data.get("methane", 0.0)
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


# @app.on_event("startup")
# async def start_background_tasks():
#     asyncio.create_task(send_sensor_data())


@app.post("/sensor")
async def receive_sensor_data(data: dict):
    asyncio.create_task(send_sensor_data(data))
    # print(data)
    # cap = cv2.VideoCapture(1)
    # if not cap.isOpened():
    #     print("❌ Could not open webcam.")
    #     return {"message": "Webcam not available"}

    # print("📸 Capturing image for received data...")

    # image_b64 = capture_image_base64(cap)
    # cap.release()

    # try:
    #     while True:
    #         image_b64 = capture_image_base64(cap)
    #         async with sensor_lock:
    #             sensor_data["email"] = "romanreigns397@gmail.com"
    #             sensor_data["container_id"] = data.get("container_id", "3")
    #             sensor_data["rack_id"] = data.get("rack_id", "2")
    #             sensor_data["temperature"] = data.get("temperature", 0.0)
    #             sensor_data["humidity"] = data.get("humidity", 0.0)
    #             sensor_data["methane"] = data.get("methane", 0.0)
    #             sensor_data["image"] = image_b64 or ""

    #             data_to_send = sensor_data.copy()

    #         print("📤 Posting sensor data...")
    #         try:
    #             requests.post(ENDPOINT, json=data_to_send)
    #         except Exception as e:
    #             print(f"Error sending data: {e}")
    # finally:
    #     cap.release()

    return {"message": "Data received successfully", "data": sensor_data}


@app.get("/sensor")
async def get_sensor_data():
    async with sensor_lock:
        return sensor_data
