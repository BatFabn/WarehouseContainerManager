import json
import os
from typing import Set
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import redis

app = FastAPI()

redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = os.getenv("REDIS_PORT", 7860)
redis_password = os.getenv("REDIS_PASSWORD", None)
redis_client = redis.Redis(
    host=redis_host, port=redis_port, password=redis_password, decode_responses=True)

connected_clients: Set[WebSocket] = set()


async def redis_listener():
    """Listens for messages on Redis and sends them to WebSocket clients."""
    pubsub = redis_client.pubsub()
    pubsub.subscribe("sensor_data")

    while True:
        message = pubsub.get_message(ignore_subscribe_messages=True)
        if message:
            try:
                data = json.loads(message["data"])
                print(f"Received from Redis: {data}")

                # Send data to all connected clients
                if connected_clients:
                    await asyncio.gather(*(ws.send_text(json.dumps(data)) for ws in connected_clients))
                else:
                    print("No clients connected.")
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {message['data']}")

        await asyncio.sleep(0.1)  # Prevents blocking


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Starts the Redis listener in the background during FastAPI's lifespan."""
    redis_task = asyncio.create_task(
        redis_listener())  # Runs in the background
    yield
    redis_task.cancel()  # Cleanup when FastAPI shuts down

app = FastAPI(lifespan=lifespan)


@app.websocket("/subscribe")
async def subscribe(websocket: WebSocket):
    """Handles new WebSocket subscriptions."""
    await websocket.accept()
    print("Client connected!")
    connected_clients.add(websocket)  # Store active WebSocket connections

    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Properly remove disconnected clients
        connected_clients.remove(websocket)
        print("Client disconnected!")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
