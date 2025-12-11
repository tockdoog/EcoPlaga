# backend/app/models/cultivo.py
from sqlalchemy import Column, Integer, String, ForeignKey
from ..database import Base

class Cultivo(Base):
    __tablename__ = "cultivos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    tipo = Column(String(150), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # NUEVO