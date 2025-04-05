import os
import json
from typing import Set
from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import DuplicateKeyError
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import asyncio
import redis
from database import db
from auth import router as auth_router
from models import ContainersManaged


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Starts the Redis listener in the background during FastAPI's lifespan."""
    redis_task = asyncio.create_task(
        redis_listener())  # Runs in the background
    yield
    redis_task.cancel()  # Cleanup when FastAPI shuts down

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)

load_dotenv()
MAX_DOCUMENTS_PER_ID = int(os.getenv("MONGO_MAX_DOCUMENTS_PER_ID"))
MAX_DOCUMENTS = int(os.getenv("MONGO_MAX_DOCUMENTS"))

collection = db["sensor_data"]
collection.create_index([("container_id", 1), ("rack_id", 1)])
collection = db["containers_managed"]
collection.create_index("email", unique=True)

redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_password = os.getenv("REDIS_PASSWORD")
redis_client = redis.Redis(
    host=redis_host, port=redis_port, password=redis_password, decode_responses=True)
print(f"Connected to redis {type(redis_host)} {type(redis_port)}")
print(
    f"Redis Config: {redis_host}:{redis_port}, Password: {bool(redis_password)}")
connected_clients: Set[WebSocket] = set()


async def redis_listener():
    """Listens for messages on Redis and sends them to WebSocket clients."""
    pubsub = redis_client.pubsub()
    pubsub.subscribe("sensor_data")
    print("Listening for Redis messages...")
    while True:
        message = pubsub.get_message(ignore_subscribe_messages=True)
        if message:
            try:
                data = json.loads(message["data"])
                print("Received data from sensor...")
                asyncio.create_task(insert_data_to_db(data))

                asyncio.create_task(handle_database_operations(data))

                print(f"Received from Redis: {data}")

                # Send data to all connected clients
                disconnected_clients = set()
                if connected_clients:
                    for ws in connected_clients:
                        try:
                            await ws.send_text(json.dumps(data))
                        except Exception:
                            print(f"⚠️ Removing disconnected WebSocket: {ws}")
                            disconnected_clients.add(ws)

                    # Remove disconnected clients
                    for ws in disconnected_clients:
                        connected_clients.discard(ws)

                else:
                    print("⚠️ No clients connected.")
            except json.JSONDecodeError:
                print(f"Invalid JSON received: {message['data']}")

        await asyncio.sleep(0.1)  # Prevents blocking


async def handle_database_operations(data):
    """Handles database insertions and cleanups asynchronously."""
    collection = db["sensor_data"]
    try:
        query = {"container_id": data.get(
            "container_id"), "rack_id": data.get("rack_id")}
        count = await collection.count_documents(query)

        if count >= MAX_DOCUMENTS_PER_ID:
            oldest_records = collection.find(
                query, sort=[("timestamp", 1)]).limit(MAX_DOCUMENTS_PER_ID // 5)
            oldest_ids = [doc["_id"] async for doc in oldest_records]

            if oldest_ids:
                await collection.delete_many({"_id": {"$in": oldest_ids}})
                print(
                    f"🗑️ Deleted {len(oldest_ids)} oldest records to free up space.")

        if await collection.count_documents({}) > MAX_DOCUMENTS:
            data["error"] = "Database storage exceeded"

        # Ensure MongoDB generates a new `_id`
        data.pop("_id", None)  # Removes `_id` if present
        await collection.insert_one(data)
        print("Data inserted into MongoDB.")

    except Exception as e:
        print(f"Database operation failed: {e}")


async def insert_data_to_db(data):
    """Insert data into MongoDB asynchronously."""
    collection = db["sensor_data"]
    try:
        await collection.insert_one(data)
        print("Data inserted into MongoDB.")
    except Exception as e:
        print(f"Failed to insert data into MongoDB: {e}")


@app.websocket("/subscribe")
async def subscribe(websocket: WebSocket):
    """Handles new WebSocket subscriptions."""
    await websocket.accept()
    print("Client connected!")
    connected_clients.add(websocket)  # Store active WebSocket connections

    try:
        while True:
            await websocket.receive_text()  # Non-blocking listen
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        connected_clients.discard(websocket)
        print("Client disconnected!")


@app.get("/data/")
async def get_rack_data(
    rack_id: str = Query(...),
    container_id: str = Query(...)
):
    collection = db["sensor_data"]
    """Retrieve documents matching rack_id and container_id."""
    query = {"rack_id": rack_id, "container_id": container_id}

    documents = await collection.find(query, sort=[("timestamp", -1)]).to_list(1000)
    documents = documents[::-1]
    for doc in documents:
        doc["_id"] = str(doc["_id"])

    return documents


@app.get("/data")
async def get_rack_data():
    """Retrieve documents matching rack_id and container_id."""
    COLLECTION_NAME = "sensor_data"
    collection = db[COLLECTION_NAME]
    unique_combos = await db[COLLECTION_NAME].aggregate([
        {"$group": {"_id": {"container_id": "$container_id", "rack_id": "$rack_id"}}}
    ]).to_list(None)

    results = []
    for combo in unique_combos:
        container_id = combo["_id"]["container_id"]
        rack_id = combo["_id"]["rack_id"]

        records = await db[COLLECTION_NAME].find(
            {"container_id": container_id, "rack_id": rack_id},
            sort=[("timestamp", -1)]
        ).limit(1).to_list(1)

        record = records[0]
        record["_id"] = str(record["_id"])

        results.append(record)

    return results


@app.post("/containers_managed")
async def upsert_container_racks(data: ContainersManaged):
    collection = db["containers_managed"]

    try:
        user = await collection.find_one({"email": data.email})

        if not user:
            await collection.insert_one(data.model_dump())
            return {"message": "New user and containers added."}

        existing_containers = user.get("containers", [])

        for new_container in data.containers:
            new_container_dict = new_container.model_dump()
            container_id = new_container_dict["container_id"]

            # Try to find if the container already exists
            updated = False
            for container in existing_containers:
                if container.get("container_id") == container_id:
                    container["rack_ids"] = new_container_dict["rack_ids"]
                    updated = True
                    break

            if not updated:
                existing_containers.append(new_container_dict)

        await collection.update_one(
            {"email": data.email},
            {"$set": {"containers": existing_containers}}
        )

        return {"message": "Containers updated successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/containers_managed")
async def get_rack_data(
    email: str = Query(...),
):
    collection = db["containers_managed"]

    container = await collection.find({"email": email}).to_list()

    results = container[0]["containers"]

    return results

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
