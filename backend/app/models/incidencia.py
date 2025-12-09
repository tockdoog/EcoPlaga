# backend/app/models/incidencia.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from ..database import Base

class Incidencia(Base):
    __tablename__ = "incidencias"
    id = Column(Integer, primary_key=True, index=True)
    cultivo_id = Column(Integer, ForeignKey("cultivos.id"), nullable=False)
    plaga_id = Column(Integer, ForeignKey("plagas.id"), nullable=False)
    descripcion = Column(String(400), nullable=True)
    severidad = Column(String(50), nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow)
