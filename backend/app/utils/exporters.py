# backend/app/utils/exporters.py
import csv
from io import StringIO
from typing import Iterable
from datetime import datetime

def incidencias_to_csv(incidencias: Iterable):
    """
    incidencias: iterable of objects or dicts with fields:
    id, cultivo_id, plaga_id, descripcion, severidad, fecha
    Returns CSV string (UTF-8)
    """
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "cultivo_id", "plaga_id", "descripcion", "severidad", "fecha"])
    for inc in incidencias:
        # support ORM objects or dicts
        id_ = getattr(inc, "id", inc.get("id") if isinstance(inc, dict) else None)
        cultivo = getattr(inc, "cultivo_id", inc.get("cultivo_id") if isinstance(inc, dict) else "")
        plaga = getattr(inc, "plaga_id", inc.get("plaga_id") if isinstance(inc, dict) else "")
        desc = getattr(inc, "descripcion", inc.get("descripcion") if isinstance(inc, dict) else "")
        sev = getattr(inc, "severidad", inc.get("severidad") if isinstance(inc, dict) else "")
        fecha = getattr(inc, "fecha", inc.get("fecha") if isinstance(inc, dict) else "")
        if isinstance(fecha, datetime):
            fecha = fecha.isoformat()
        writer.writerow([id_, cultivo, plaga, desc or "", sev or "", fecha or ""])
    return output.getvalue()
