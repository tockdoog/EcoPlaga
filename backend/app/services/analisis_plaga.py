# backend/app/services/analisis_plagas.py
import pandas as pd
from typing import Iterable

def resumen_por_plaga(incidencias: Iterable[dict]) -> dict:
    """
    Recibe una lista de incidencias (o iterable de dicts/ORM obj),
    devuelve conteo por plaga_id y por severidad.
    """
    rows = []
    for inc in incidencias:
        # normalize
        if hasattr(inc, "__dict__"):
            d = {
                "plaga_id": getattr(inc, "plaga_id", None),
                "severidad": getattr(inc, "severidad", None)
            }
        else:
            d = {"plaga_id": inc.get("plaga_id"), "severidad": inc.get("severidad")}
        rows.append(d)
    if not rows:
        return {}
    df = pd.DataFrame(rows)
    counts = df.groupby("plaga_id").size().to_dict()
    sev = df.groupby(["plaga_id", "severidad"]).size().unstack(fill_value=0).to_dict()
    return {"counts": counts, "by_severity": sev}
