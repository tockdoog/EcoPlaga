# backend/app/models/tratamiento.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from ..database import Base

class Tratamiento(Base):
    __tablename__ = "tratamientos"
    id = Column(Integer, primary_key=True, index=True)
    plaga_id = Column(Integer, ForeignKey("plagas.id"), nullable=False)
    descripcion = Column(String(500), nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
