from typing import List, Optional
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


class AllowedUser(BaseModel):
    email: EmailStr
    role: str  # "View only" or "View and Manage only"


class Member(BaseModel):
    name: str
    email: EmailStr
    role: str
    allowed_users: Optional[List[AllowedUser]] = []
    actions: Optional[List[dict]] = []


class ActionLog(BaseModel):
    target_email: EmailStr
    performed_by: EmailStr
    message: str


class AddAllowedUserRequest(BaseModel):
    owner_email: EmailStr
    user: AllowedUser


class UpdateAllowedUserRole(BaseModel):
    owner_email: EmailStr
    target_user_email: EmailStr
    new_role: str
