# backend/app/routers/cultivos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session  # Cambiado
from ..models.cultivo import Cultivo
from ..schemas.cultivo import CultivoCreate, CultivoRead
from ..utils.security import get_current_user_id

router = APIRouter(prefix="/cultivos", tags=["cultivos"])

@router.post("/", response_model=CultivoRead)
async def create_cultivo(payload: CultivoCreate, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    new = Cultivo(**payload.dict())
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("/", response_model=list[CultivoRead])
async def list_cultivos(db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Cultivo))
    return q.scalars().all()

@router.get("/{cultivo_id}", response_model=CultivoRead)
async def get_cultivo(cultivo_id: int, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Cultivo).where(Cultivo.id == cultivo_id))
    cultivo = q.scalar_one_or_none()
    if not cultivo:
        raise HTTPException(404, "Cultivo not found")
    return cultivo

@router.put("/{cultivo_id}", response_model=CultivoRead)
async def update_cultivo(cultivo_id: int, payload: CultivoCreate, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Cultivo).where(Cultivo.id == cultivo_id))
    cultivo = q.scalar_one_or_none()
    if not cultivo:
        raise HTTPException(404, "Cultivo not found")
    for k, v in payload.dict().items():
        setattr(cultivo, k, v)
    await db.commit()
    await db.refresh(cultivo)
    return cultivo

@router.delete("/{cultivo_id}")
async def delete_cultivo(cultivo_id: int, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Cultivo).where(Cultivo.id == cultivo_id))
    cultivo = q.scalar_one_or_none()
    if not cultivo:
        raise HTTPException(404, "Cultivo not found")
    await db.delete(cultivo)
    await db.commit()
    return {"msg": "Cultivo deleted"}