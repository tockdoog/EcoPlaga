# backend/app/routers/plagas.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..models.plaga import Plaga
from ..schemas.plaga import PlagaCreate, PlagaRead
from ..utils.security import get_current_user_id

router = APIRouter(prefix="/plagas", tags=["plagas"])

@router.post("/", response_model=PlagaRead)
async def create_plaga(
    payload: PlagaCreate, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Agregar user_id al crear
    new = Plaga(**payload.dict(), user_id=user_id)
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("/", response_model=list[PlagaRead])
async def list_plagas(
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Filtrar solo plagas del usuario actual
    q = await db.execute(
        select(Plaga).where(Plaga.user_id == user_id)
    )
    return q.scalars().all()

@router.get("/{plaga_id}", response_model=PlagaRead)
async def get_plaga(
    plaga_id: int, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Verificar que la plaga pertenezca al usuario
    q = await db.execute(
        select(Plaga).where(
            Plaga.id == plaga_id,
            Plaga.user_id == user_id
        )
    )
    p = q.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Plaga not found or access denied")
    return p

@router.put("/{plaga_id}", response_model=PlagaRead)
async def update_plaga(
    plaga_id: int, 
    payload: PlagaCreate, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    q = await db.execute(
        select(Plaga).where(
            Plaga.id == plaga_id,
            Plaga.user_id == user_id
        )
    )
    p = q.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Plaga not found or access denied")
    
    for k, v in payload.dict().items():
        setattr(p, k, v)
    await db.commit()
    await db.refresh(p)
    return p

@router.delete("/{plaga_id}")
async def delete_plaga(
    plaga_id: int, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    q = await db.execute(
        select(Plaga).where(
            Plaga.id == plaga_id,
            Plaga.user_id == user_id
        )
    )
    p = q.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Plaga not found or access denied")
    
    await db.delete(p)
    await db.commit()
    return {"msg": "Plaga deleted"}