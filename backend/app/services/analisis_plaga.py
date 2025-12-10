# backend/app/services/analisis_plaga.py
import pandas as pd
import numpy as np
from typing import Iterable, List, Dict
from datetime import datetime, timedelta


def resumen_por_plaga(incidencias: Iterable[dict]) -> dict:
    """
    Recibe una lista de incidencias, devuelve conteo por plaga_id y por severidad.
    """
    rows = []
    for inc in incidencias:
        if hasattr(inc, "__dict__"):
            d = {
                "plaga_id": getattr(inc, "plaga_id", None),
                "severidad": getattr(inc, "severidad", None)
            }
        else:
            d = {"plaga_id": inc.get("plaga_id"), "severidad": inc.get("severidad")}
        rows.append(d)
    
    if not rows:
        return {"counts": {}, "by_severity": {}}
    
    df = pd.DataFrame(rows)
    
    # Conteo total por plaga
    counts = df.groupby("plaga_id").size().to_dict()
    
    # Conteo por severidad
    if "severidad" in df.columns:
        sev_df = df.groupby(["plaga_id", "severidad"]).size().unstack(fill_value=0)
        by_severity = {
            int(plaga_id): sev_df.loc[plaga_id].to_dict() 
            for plaga_id in sev_df.index
        }
    else:
        by_severity = {}
    
    return {
        "counts": {int(k): int(v) for k, v in counts.items()},
        "by_severity": by_severity
    }


def estadisticas_generales(incidencias: List[dict]) -> dict:
    """
    Calcula estadísticas generales usando Numpy y Pandas
    """
    if not incidencias:
        return {}
    
    df = pd.DataFrame(incidencias)
    
    # Severidad más común
    severidad_counts = df["severidad"].value_counts().to_dict() if "severidad" in df.columns else {}
    severidad_mas_comun = df["severidad"].mode()[0] if "severidad" in df.columns and len(df) > 0 else None
    
    # Plaga más frecuente
    plaga_counts = df["plaga_id"].value_counts()
    plaga_mas_frecuente = int(plaga_counts.index[0]) if len(plaga_counts) > 0 else None
    frecuencia_maxima = int(plaga_counts.iloc[0]) if len(plaga_counts) > 0 else 0
    
    # Cultivo más afectado
    cultivo_counts = df["cultivo_id"].value_counts()
    cultivo_mas_afectado = int(cultivo_counts.index[0]) if len(cultivo_counts) > 0 else None
    
    # Distribución de severidad
    severidad_map = {"Baja": 1, "Media": 2, "Alta": 3, "Crítica": 4}
    if "severidad" in df.columns:
        df["severidad_num"] = df["severidad"].map(severidad_map).fillna(2)
        severidad_promedio = float(df["severidad_num"].mean())
    else:
        severidad_promedio = 2.0
    
    return {
        "total_incidencias": len(df),
        "plagas_unicas": int(df["plaga_id"].nunique()),
        "cultivos_afectados": int(df["cultivo_id"].nunique()),
        "plaga_mas_frecuente": plaga_mas_frecuente,
        "frecuencia_maxima": frecuencia_maxima,
        "cultivo_mas_afectado": cultivo_mas_afectado,
        "severidad_promedio": round(severidad_promedio, 2),
        "severidad_mas_comun": severidad_mas_comun,
        "distribucion_severidad": {k: int(v) for k, v in severidad_counts.items()}
    }


def analisis_tendencias(incidencias: List[dict]) -> List[dict]:
    """
    Analiza tendencias temporales de incidencias
    """
    if not incidencias:
        return []
    
    df = pd.DataFrame(incidencias)
    
    # Convertir fecha a datetime
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
        df = df.dropna(subset=["fecha"])
        
        if len(df) == 0:
            return []
        
        # Agrupar por fecha y contar
        df["fecha_solo"] = df["fecha"].dt.date
        tendencias = df.groupby("fecha_solo").size().reset_index(name="count")
        
        # Calcular tendencia (últimos 7 días vs 7 días anteriores)
        hoy = datetime.now().date()
        hace_7_dias = hoy - timedelta(days=7)
        hace_14_dias = hoy - timedelta(days=14)
        
        recientes = df[df["fecha_solo"] >= hace_7_dias]
        anteriores = df[(df["fecha_solo"] >= hace_14_dias) & (df["fecha_solo"] < hace_7_dias)]
        
        incidencias_recientes = len(recientes)
        incidencias_anteriores = len(anteriores)
        
        if incidencias_anteriores > 0:
            cambio_porcentual = ((incidencias_recientes - incidencias_anteriores) / incidencias_anteriores) * 100
        else:
            cambio_porcentual = 100.0 if incidencias_recientes > 0 else 0.0
        
        return [
            {
                "periodo": "Últimos 7 días",
                "cantidad": int(incidencias_recientes),
                "cambio_porcentual": round(cambio_porcentual, 1),
                "tendencia": "aumento" if cambio_porcentual > 10 else "disminución" if cambio_porcentual < -10 else "estable"
            }
        ]
    
    return []


def calcular_riesgo(incidencias: List[dict], plaga_id: int) -> dict:
    """
    Calcula el nivel de riesgo para una plaga específica
    """
    df = pd.DataFrame(incidencias)
    df_plaga = df[df["plaga_id"] == plaga_id]
    
    if len(df_plaga) == 0:
        return {"riesgo": "bajo", "score": 0}
    
    # Factores de riesgo
    frecuencia = len(df_plaga)
    
    severidad_map = {"Baja": 1, "Media": 2, "Alta": 3, "Crítica": 4}
    if "severidad" in df_plaga.columns:
        df_plaga["severidad_num"] = df_plaga["severidad"].map(severidad_map).fillna(2)
        severidad_promedio = df_plaga["severidad_num"].mean()
    else:
        severidad_promedio = 2.0
    
    # Calcular score de riesgo (0-100)
    score = min(100, (frecuencia * 10) + (severidad_promedio * 15))
    
    # Clasificar riesgo
    if score >= 70:
        nivel = "crítico"
    elif score >= 50:
        nivel = "alto"
    elif score >= 30:
        nivel = "medio"
    else:
        nivel = "bajo"
    
    return {
        "riesgo": nivel,
        "score": round(float(score), 1),
        "frecuencia": int(frecuencia),
        "severidad_promedio": round(float(severidad_promedio), 2)
    }