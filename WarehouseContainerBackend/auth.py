from fastapi import APIRouter, HTTPException, status
from models import UserCreate, UserLogin
from database import db
from utils import hash_password, verify_password, create_access_token

router = APIRouter()

users_collection = db["users"]


@router.post("/signup")
async def signup(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    if len(user.password) < 6:
        raise HTTPException(
            status_code=400, detail="Password too short (min 6 characters)")

    hashed_pwd = hash_password(user.password)
    await users_collection.insert_one({"email": user.email, "hashed_password": hashed_pwd})
    return {"message": "User created"}


@router.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Email not registered")

    if not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}
