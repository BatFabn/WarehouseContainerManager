from typing import List
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Containers(BaseModel):
    container_id: str
    rack_ids: List[str]


class ContainersManaged(BaseModel):
    email: EmailStr
    containers: List[Containers]
