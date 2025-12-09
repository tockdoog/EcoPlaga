# backend/app/schemas/incidencia.py
from pydantic import BaseModel
from datetime import datetime

class IncidenciaBase(BaseModel):
    cultivo_id: int
    plaga_id: int
    descripcion: str | None = None
    severidad: str | None = None

class IncidenciaCreate(IncidenciaBase):
    pass

class IncidenciaRead(IncidenciaBase):
    id: int
    fecha: datetime

    class Config:
        orm_mode = True
