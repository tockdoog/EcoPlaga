# backend/app/routers/incidencias.py
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_session  # Cambiado
from ..models.incidencia import Incidencia
from ..schemas.incidencia import IncidenciaCreate, IncidenciaRead
from ..utils.security import get_current_user_id
from ..utils.exporters import incidencias_to_csv
from fastapi.responses import StreamingResponse
from io import BytesIO

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

@router.post("/", response_model=IncidenciaRead)
async def create_incidencia(payload: IncidenciaCreate, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    new = Incidencia(**payload.dict())
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("/", response_model=list[IncidenciaRead])
async def list_incidencias(db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Incidencia))
    return q.scalars().all()

@router.get("/{incidencia_id}", response_model=IncidenciaRead)
async def get_incidencia(incidencia_id: int, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Incidencia).where(Incidencia.id == incidencia_id))
    inc = q.scalar_one_or_none()
    if not inc:
        raise HTTPException(404, "Incidencia not found")
    return inc

@router.put("/{incidencia_id}", response_model=IncidenciaRead)
async def update_incidencia(incidencia_id: int, payload: IncidenciaCreate, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Incidencia).where(Incidencia.id == incidencia_id))
    inc = q.scalar_one_or_none()
    if not inc:
        raise HTTPException(404, "Incidencia not found")
    for k, v in payload.dict().items():
        setattr(inc, k, v)
    await db.commit()
    await db.refresh(inc)
    return inc

@router.delete("/{incidencia_id}")
async def delete_incidencia(incidencia_id: int, db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Incidencia).where(Incidencia.id == incidencia_id))
    inc = q.scalar_one_or_none()
    if not inc:
        raise HTTPException(404, "Incidencia not found")
    await db.delete(inc)
    await db.commit()
    return {"msg": "Incidencia deleted"}

# export CSV
@router.get("/export/csv")
async def export_csv(db: AsyncSession = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    q = await db.execute(select(Incidencia))
    rows = q.scalars().all()
    csv_text = incidencias_to_csv(rows)
    buffer = BytesIO(csv_text.encode("utf-8"))
    return StreamingResponse(buffer, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=incidencias.csv"})