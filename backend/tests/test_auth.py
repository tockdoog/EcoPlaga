# backend/tests/test_auth.py
import pytest
from httpx import AsyncClient
from backend.app.main import app

@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # register
        r = await ac.post("/auth/register", json={"name":"test","email":"t@test.com","password":"pass123"})
        assert r.status_code in (200,201)
        # login via token endpoint (OAuth2PasswordRequestForm needs form data)
        r2 = await ac.post("/auth/token", data={"username":"t@test.com","password":"pass123"})
        assert r2.status_code == 200
        token = r2.json().get("access_token")
        assert token
