import redis
import os
redis_host = os.getenv("REDIS_HOST", "localhost")
redis_port = os.getenv("REDIS_PORT", 7860)
redis_password = os.getenv("REDIS_PASSWORD", None)
redis_client = redis.Redis(
    host=redis_host, port=redis_port, password=redis_password, decode_responses=True)
print(redis_client.ping())
