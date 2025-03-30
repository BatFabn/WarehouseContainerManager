import asyncio
import random
import httpx
from fastapi import FastAPI, BackgroundTasks
from dotenv import load_dotenv
import os

app = FastAPI()

load_dotenv()
ENDPOINT = os.getenv("WAREHOUSE_SERVER_ENDPOINT")

# Store the latest sensor readings
sensor_data = {"temperature": 0.0, "humidity": 0.0, "methane": 0.0}


async def send_sensor_data():
    """Continuously sends sensor data to the /sensor endpoint."""
    async with httpx.AsyncClient() as client:
        while True:
            # Simulate sensor data
            sensor_data["temperature"] = round(random.uniform(20, 35), 2)
            sensor_data["humidity"] = round(random.uniform(40, 70), 2)
            sensor_data["methane"] = round(random.uniform(100, 500), 2)

            print(f"Posting Data: {sensor_data}")

            # Send data to the endpoint
            try:
                await client.post(ENDPOINT, json=sensor_data)
            except Exception as e:
                print(f"Error sending data: {e}")

            await asyncio.sleep(5)  # Wait 5 seconds before sending next data


@app.on_event("startup")
async def start_background_task():
    """Start the background task when the server starts."""
    asyncio.create_task(send_sensor_data())


@app.post("/sensor")
async def receive_sensor_data(data: dict):
    """Receive sensor data and update the latest readings."""
    global sensor_data
    sensor_data.update(data)
    return {"message": "Data received successfully", "data": sensor_data}


@app.get("/sensor")
async def get_sensor_data():
    """Fetch the latest sensor readings."""
    return sensor_data
