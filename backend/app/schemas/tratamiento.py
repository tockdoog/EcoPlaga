# backend/app/schemas/tratamiento.py
from pydantic import BaseModel
from datetime import datetime

class TratamientoBase(BaseModel):
    plaga_id: int
    descripcion: str

class TratamientoCreate(TratamientoBase):
    pass

class TratamientoRead(TratamientoBase):
    id: int
    fecha: datetime

    class Config:
        orm_mode = True
