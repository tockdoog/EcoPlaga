import pytest
from httpx import AsyncClient
from backend.app.main import app

@pytest.mark.asyncio
async def test_plaga_crud():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/plagas/", json={"nombre":"Gusano", "descripcion":"Come hojas", "severidad":"moderada"})
        assert r.status_code == 200
        r2 = await ac.get("/plagas/")
        assert r2.status_code == 200
        assert any(p["nombre"] == "Gusano" for p in r2.json())
