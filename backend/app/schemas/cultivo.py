# backend/app/schemas/cultivo.py
from pydantic import BaseModel

class CultivoBase(BaseModel):
    nombre: str
    tipo: str | None = None

class CultivoCreate(CultivoBase):
    pass

class CultivoRead(CultivoBase):
    id: int

    class Config:
        orm_mode = True
