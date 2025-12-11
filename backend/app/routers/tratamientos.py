# backend/app/routers/tratamientos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session
from ..models.tratamiento import Tratamiento
from ..schemas.tratamiento import TratamientoCreate, TratamientoRead
from ..utils.security import get_current_user_id

router = APIRouter(prefix="/tratamientos", tags=["tratamientos"])

@router.post("/", response_model=TratamientoRead)
async def create_tratamiento(
    payload: TratamientoCreate, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Agregar user_id al crear
    new = Tratamiento(**payload.dict(), user_id=user_id)
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("/", response_model=list[TratamientoRead])
async def list_tratamientos(
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Filtrar solo tratamientos del usuario actual
    q = await db.execute(
        select(Tratamiento).where(Tratamiento.user_id == user_id)
    )
    return q.scalars().all()

@router.get("/{tratamiento_id}", response_model=TratamientoRead)
async def get_tratamiento(
    tratamiento_id: int, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    # Verificar que el tratamiento pertenezca al usuario
    q = await db.execute(
        select(Tratamiento).where(
            Tratamiento.id == tratamiento_id,
            Tratamiento.user_id == user_id
        )
    )
    t = q.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Tratamiento not found or access denied")
    return t

@router.put("/{tratamiento_id}", response_model=TratamientoRead)
async def update_tratamiento(
    tratamiento_id: int, 
    payload: TratamientoCreate, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    q = await db.execute(
        select(Tratamiento).where(
            Tratamiento.id == tratamiento_id,
            Tratamiento.user_id == user_id
        )
    )
    t = q.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Tratamiento not found or access denied")
    
    for k, v in payload.dict().items():
        setattr(t, k, v)
    await db.commit()
    await db.refresh(t)
    return t

@router.delete("/{tratamiento_id}")
async def delete_tratamiento(
    tratamiento_id: int, 
    db: AsyncSession = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    q = await db.execute(
        select(Tratamiento).where(
            Tratamiento.id == tratamiento_id,
            Tratamiento.user_id == user_id
        )
    )
    t = q.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Tratamiento not found or access denied")
    
    await db.delete(t)
    await db.commit()
    return {"msg": "Tratamiento deleted"}