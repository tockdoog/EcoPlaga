# backend/app/routers/recomendaciones.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_session
from ..models.incidencia import Incidencia
from ..models.plaga import Plaga
from ..models.cultivo import Cultivo
from ..services.analisis_plaga import resumen_por_plaga, analisis_tendencias, estadisticas_generales
from ..services.recomendaciones import generar_recomendaciones, generar_alertas
from ..utils.security import get_current_user_id

router = APIRouter(prefix="/recomendaciones", tags=["recomendaciones"])


@router.get("/analisis")
async def obtener_analisis(
    db: AsyncSession = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    """
    Endpoint principal: devuelve análisis completo de incidencias
    - Resumen por plaga
    - Estadísticas generales
    - Tendencias
    """
    # Cargar incidencias
    q = await db.execute(select(Incidencia))
    incidencias = q.scalars().all()
    
    if not incidencias:
        return {
            "total_incidencias": 0,
            "resumen_plagas": {},
            "estadisticas": {},
            "tendencias": []
        }
    
    # Convertir a lista de diccionarios
    inc_dicts = [
        {
            "id": inc.id,
            "plaga_id": inc.plaga_id,
            "cultivo_id": inc.cultivo_id,
            "severidad": inc.severidad,
            "fecha": inc.fecha.isoformat() if inc.fecha else None,
            "descripcion": inc.descripcion
        }
        for inc in incidencias
    ]
    
    # Análisis con servicios
    resumen = resumen_por_plaga(inc_dicts)
    estadisticas = estadisticas_generales(inc_dicts)
    tendencias = analisis_tendencias(inc_dicts)
    
    # Obtener nombres de plagas
    plagas_ids = list(set(inc.plaga_id for inc in incidencias))
    q_plagas = await db.execute(select(Plaga).where(Plaga.id.in_(plagas_ids)))
    plagas = {p.id: p.nombre for p in q_plagas.scalars().all()}
    
    return {
        "total_incidencias": len(incidencias),
        "resumen_plagas": resumen,
        "estadisticas": estadisticas,
        "tendencias": tendencias,
        "plagas_nombres": plagas
    }


@router.get("/alertas")
async def obtener_alertas(
    db: AsyncSession = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    """
    Genera alertas automáticas basadas en severidad e incidencias
    """
    q = await db.execute(select(Incidencia))
    incidencias = q.scalars().all()
    
    if not incidencias:
        return {"alertas": []}
    
    # Convertir a diccionarios
    inc_dicts = [
        {
            "id": inc.id,
            "plaga_id": inc.plaga_id,
            "cultivo_id": inc.cultivo_id,
            "severidad": inc.severidad,
            "fecha": inc.fecha.isoformat() if inc.fecha else None
        }
        for inc in incidencias
    ]
    
    alertas = generar_alertas(inc_dicts)
    
    # Enriquecer con nombres
    plagas_ids = list(set(a["plaga_id"] for a in alertas if "plaga_id" in a))
    if plagas_ids:
        q_plagas = await db.execute(select(Plaga).where(Plaga.id.in_(plagas_ids)))
        plagas = {p.id: p.nombre for p in q_plagas.scalars().all()}
        
        for alerta in alertas:
            if "plaga_id" in alerta:
                alerta["plaga_nombre"] = plagas.get(alerta["plaga_id"], "Desconocida")
    
    return {"alertas": alertas}


@router.get("/sugerencias")
async def obtener_sugerencias(
    db: AsyncSession = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    """
    Genera recomendaciones de tratamiento basadas en incidencias
    """
    q = await db.execute(select(Incidencia))
    incidencias = q.scalars().all()
    
    if not incidencias:
        return {"sugerencias": []}
    
    # Convertir a diccionarios
    inc_dicts = [
        {
            "id": inc.id,
            "plaga_id": inc.plaga_id,
            "cultivo_id": inc.cultivo_id,
            "severidad": inc.severidad,
            "descripcion": inc.descripcion
        }
        for inc in incidencias
    ]
    
    sugerencias = generar_recomendaciones(inc_dicts)
    
    # Enriquecer con nombres
    plagas_ids = list(set(s["plaga_id"] for s in sugerencias if "plaga_id" in s))
    if plagas_ids:
        q_plagas = await db.execute(select(Plaga).where(Plaga.id.in_(plagas_ids)))
        plagas = {p.id: p.nombre for p in q_plagas.scalars().all()}
        
        for sug in sugerencias:
            if "plaga_id" in sug:
                sug["plaga_nombre"] = plagas.get(sug["plaga_id"], "Desconocida")
    
    return {"sugerencias": sugerencias}