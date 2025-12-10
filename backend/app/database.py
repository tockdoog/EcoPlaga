# backend/app/database.py
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import DATABASE_URL

# engine and session
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# dependency - RENOMBRADA
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

# init DB (create tables)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)