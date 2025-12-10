# backend/app/services/recomendaciones.py
from typing import List, Dict
import pandas as pd
from datetime import datetime, timedelta


def generar_recomendaciones(incidencias: List[dict]) -> List[dict]:
    """
    Genera recomendaciones de tratamiento basadas en análisis de incidencias
    """
    if not incidencias:
        return []
    
    df = pd.DataFrame(incidencias)
    recomendaciones = []
    
    # Agrupar por plaga
    for plaga_id in df["plaga_id"].unique():
        df_plaga = df[df["plaga_id"] == plaga_id]
        
        # Contar severidades
        severidades = df_plaga["severidad"].value_counts().to_dict() if "severidad" in df_plaga.columns else {}
        total = len(df_plaga)
        
        # Determinar recomendación según severidad
        criticas = severidades.get("Crítica", 0)
        altas = severidades.get("Alta", 0)
        medias = severidades.get("Media", 0)
        
        if criticas > 0:
            accion = "⚠️ ACCIÓN URGENTE"
            recomendacion = "Aplicar tratamiento intensivo inmediato. Considerar fumigación profesional y aislamiento de áreas afectadas."
            prioridad = "crítica"
        elif altas >= 2 or (altas + criticas) >= 3:
            accion = "🔴 ALTA PRIORIDAD"
            recomendacion = "Aplicar tratamiento químico específico. Aumentar frecuencia de monitoreo a diario."
            prioridad = "alta"
        elif (altas + medias) >= 3:
            accion = "🟡 MONITOREAR"
            recomendacion = "Aplicar tratamiento preventivo. Monitorear evolución cada 2-3 días."
            prioridad = "media"
        else:
            accion = "🟢 CONTROL REGULAR"
            recomendacion = "Mantener programa de control preventivo. Inspección semanal."
            prioridad = "baja"
        
        recomendaciones.append({
            "plaga_id": int(plaga_id),
            "total_incidencias": int(total),
            "accion": accion,
            "recomendacion": recomendacion,
            "prioridad": prioridad,
            "detalles": {
                "criticas": int(criticas),
                "altas": int(altas),
                "medias": int(medias),
                "bajas": int(severidades.get("Baja", 0))
            }
        })
    
    # Ordenar por prioridad
    prioridad_orden = {"crítica": 0, "alta": 1, "media": 2, "baja": 3}
    recomendaciones.sort(key=lambda x: prioridad_orden.get(x["prioridad"], 4))
    
    return recomendaciones


def generar_alertas(incidencias: List[dict]) -> List[dict]:
    """
    Genera alertas automáticas basadas en patrones detectados
    """
    if not incidencias:
        return []
    
    df = pd.DataFrame(incidencias)
    alertas = []
    
    # Alerta 1: Incidencias críticas recientes
    if "severidad" in df.columns:
        criticas = df[df["severidad"] == "Crítica"]
        if len(criticas) > 0:
            alertas.append({
                "tipo": "critica",
                "titulo": "⚠️ Incidencias Críticas Detectadas",
                "mensaje": f"Se han registrado {len(criticas)} incidencias de severidad crítica. Se requiere acción inmediata.",
                "nivel": "danger",
                "cantidad": int(len(criticas))
            })
    
    # Alerta 2: Plaga muy frecuente
    plaga_counts = df["plaga_id"].value_counts()
    if len(plaga_counts) > 0:
        plaga_top = plaga_counts.index[0]
        count_top = plaga_counts.iloc[0]
        if count_top >= 5:
            alertas.append({
                "tipo": "frecuencia",
                "titulo": "📊 Plaga con Alta Frecuencia",
                "mensaje": f"La plaga #{plaga_top} ha sido reportada {count_top} veces. Considere medidas preventivas adicionales.",
                "nivel": "warning",
                "plaga_id": int(plaga_top),
                "cantidad": int(count_top)
            })
    
    # Alerta 3: Tendencia al alza (si hay fechas)
    if "fecha" in df.columns:
        df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
        df = df.dropna(subset=["fecha"])
        
        if len(df) > 0:
            hoy = datetime.now()
            hace_7_dias = hoy - timedelta(days=7)
            hace_14_dias = hoy - timedelta(days=14)
            
            recientes = df[df["fecha"] >= hace_7_dias]
            anteriores = df[(df["fecha"] >= hace_14_dias) & (df["fecha"] < hace_7_dias)]
            
            if len(anteriores) > 0:
                cambio = ((len(recientes) - len(anteriores)) / len(anteriores)) * 100
                
                if cambio > 50:
                    alertas.append({
                        "tipo": "tendencia",
                        "titulo": "📈 Aumento Significativo de Incidencias",
                        "mensaje": f"Las incidencias han aumentado un {cambio:.1f}% en la última semana. Reforzar medidas de control.",
                        "nivel": "warning",
                        "cambio_porcentual": round(cambio, 1)
                    })
    
    # Alerta 4: Múltiples cultivos afectados
    cultivos_afectados = df["cultivo_id"].nunique()
    if cultivos_afectados >= 3:
        alertas.append({
            "tipo": "propagacion",
            "titulo": "🌾 Propagación Detectada",
            "mensaje": f"Se han detectado plagas en {cultivos_afectados} cultivos diferentes. Implementar medidas de contención.",
            "nivel": "info",
            "cultivos_afectados": int(cultivos_afectados)
        })
    
    # Si no hay alertas, generar mensaje positivo
    if len(alertas) == 0:
        alertas.append({
            "tipo": "normal",
            "titulo": "✅ Situación Bajo Control",
            "mensaje": "No se han detectado patrones de riesgo. Continuar con el programa regular de monitoreo.",
            "nivel": "success"
        })
    
    return alertas


def sugerir_tratamientos(plaga_id: int, severidad: str) -> List[str]:
    """
    Sugiere tratamientos específicos según plaga y severidad
    """
    # Base de conocimiento simple (puede expandirse)
    tratamientos = {
        "Crítica": [
            "Aplicar insecticida sistémico de amplio espectro",
            "Contactar servicio profesional de fumigación",
            "Aislar área afectada para evitar propagación",
            "Eliminar plantas gravemente afectadas"
        ],
        "Alta": [
            "Aplicar insecticida específico para la plaga",
            "Aumentar frecuencia de aplicación",
            "Implementar trampas y control mecánico",
            "Monitoreo diario de evolución"
        ],
        "Media": [
            "Aplicar tratamiento orgánico o biológico",
            "Control manual de plagas visibles",
            "Mejorar ventilación y drenaje",
            "Monitoreo cada 2-3 días"
        ],
        "Baja": [
            "Mantener programa preventivo regular",
            "Inspección visual semanal",
            "Aplicar productos naturales repelentes",
            "Promover control biológico natural"
        ]
    }
    
    return tratamientos.get(severidad, tratamientos["Media"])