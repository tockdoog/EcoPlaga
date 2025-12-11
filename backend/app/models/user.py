# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
import enum
from ..database import Base

class UserRole(str, enum.Enum):
    AGRICULTOR = "agricultor"
    INSPECTOR = "inspector"
    ADMINISTRADOR = "administrador"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    farm_name = Column(String(200), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.AGRICULTOR)
    created_at = Column(DateTime, default=datetime.utcnow)