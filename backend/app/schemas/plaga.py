# backend/app/schemas/plaga.py
from pydantic import BaseModel

class PlagaBase(BaseModel):
    nombre: str
    descripcion: str | None = None

class PlagaCreate(PlagaBase):
    pass

class PlagaRead(PlagaBase):
    id: int

    class Config:
        orm_mode = True
