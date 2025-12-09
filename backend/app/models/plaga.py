# backend/app/models/plaga.py
from sqlalchemy import Column, Integer, String
from ..database import Base

class Plaga(Base):
    __tablename__ = "plagas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(400), nullable=True)
