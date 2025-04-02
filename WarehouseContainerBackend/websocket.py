import os
import json
from typing import Set
from fastapi import FastAPI, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import asyncio
import redis


app = FastAPI()

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL")
MAX_DOCUMENTS_PER_ID = int(os.getenv("MONGO_MAX_DOCUMENTS_PER_ID"))
MAX_DOCUMENTS = int(os.getenv("MONGO_MAX_DOCUMENTS"))

client = AsyncIOMotorClient(MONGO_URL)
db = client["rack_database"]
collection = db["sensor_data"]
collection.create_index([("container_id", 1), ("rack_id", 1)])

redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_password = os.getenv("REDIS_PASSWORD")
redis_client = redis.Redis(
    host=redis_host, port=redis_port, password=redis_password, decode_responses=True)
print(f"Connected to redis")

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
                asyncio.create_task(insert_data_to_db(data))

                query = {
                    "container_id": data.get("container_id"), "rack_id": data.get("rack_id")}
                count = await collection.estimated_document_count(query)
                if count >= MAX_DOCUMENTS_PER_ID:
                    oldest_records = collection.find(
                        query, sort=[("timestamp", 1)]).limit(MAX_DOCUMENTS_PER_ID//5)

                    oldest_ids = [doc["_id"] async for doc in oldest_records]

                    if oldest_ids:
                        await collection.delete_many({"_id": {"$in": oldest_ids}})
                        print(
                            f"🗑️ Deleted {len(oldest_ids)} oldest records to free up space.")
                if await collection.count_documents({}) > MAX_DOCUMENTS:
                    data["error"] = "Database storage exceeded"

                print(f"Received from Redis: {data}")

                # Send data to all connected clients
                if connected_clients:
                    await asyncio.gather(*(ws.send_text(json.dumps(data)) for ws in connected_clients))
                else:
                    print("No clients connected.")
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {message['data']}")

        await asyncio.sleep(0.1)  # Prevents blocking


async def insert_data_to_db(data):
    """Insert data into MongoDB asynchronously."""
    try:
        await collection.insert_one(data)
        print("Data inserted into MongoDB.")
    except Exception as e:
        print(f"Failed to insert data into MongoDB: {e}")


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


@app.get("/data/")
async def get_rack_data(
    rack_id: int = Query(...),
    container_id: int = Query(...)
):
    """Retrieve documents matching rack_id and container_id."""
    query = {"rack_id": int(rack_id), "container_id": int(container_id)}

    documents = await collection.find(query, sort=[("timestamp", -1)]).to_list(1000)

    for doc in documents:
        doc["_id"] = str(doc["_id"])

    return documents

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
