# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    farm_name: str
    password: str


class UserRead(BaseModel):  # Cambiado de UserResponse a UserRead
    id: int
    name: str
    email: EmailStr
    farm_name: str

    class Config:
        orm_mode = True