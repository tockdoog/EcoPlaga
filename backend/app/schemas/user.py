# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRole:
    AGRICULTOR = "agricultor"
    INSPECTOR = "inspector"
    ADMINISTRADOR = "administrador"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    farm_name: str
    password: str
    role: str = UserRole.AGRICULTOR  # Default

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    farm_name: str
    role: str

    class Config:
        orm_mode = True