# backend/app/services/recomendaciones.py
from typing import Iterable

def generar_recomendaciones(incidencias: Iterable):
    """
    Regla simple demo:
    - Si hay incidencias con severidad 'alta' -> recomendar tratamiento A
    - Esto es un ejemplo; puedes integrar pandas/ML aquí.
    """
    reco = []
    for inc in incidencias:
        sev = getattr(inc, "severidad", None) if hasattr(inc, "__dict__") else inc.get("severidad")
        plaga_id = getattr(inc, "plaga_id", None) if hasattr(inc, "__dict__") else inc.get("plaga_id")
        if sev and sev.lower() == "alta":
            reco.append({"plaga_id": plaga_id, "recomendacion": "Tratamiento intensivo: insecticida X"})
        else:
            reco.append({"plaga_id": plaga_id, "recomendacion": "Monitorear y aplicar tratamiento leve"})
    return reco
