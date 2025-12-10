# backend/app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .database import init_db
from .routers import auth, users, cultivos, plagas, incidencias, tratamientos

app = FastAPI(title="EcoPlaga")

# static and templates (frontend files you manage)
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

# include API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cultivos.router)
app.include_router(plagas.router)
app.include_router(incidencias.router)
app.include_router(tratamientos.router)

@app.on_event("startup")
async def on_startup():
    await init_db()

# frontend routes (templates)
@app.get("/", response_class=HTMLResponse)
def root_redirect(request: Request):
    """Página de inicio - muestra el login"""
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    """Página de login"""
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    """Página de registro"""
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(request: Request):
    """Dashboard principal - requiere autenticación"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/plagas", response_class=HTMLResponse)
def plagas_page(request: Request):
    """Gestión de plagas (CRUD)"""
    return templates.TemplateResponse("plagas.html", {"request": request})

@app.get("/incidencias", response_class=HTMLResponse)
def incidencias_page(request: Request):
    """Registro de incidencias"""
    return templates.TemplateResponse("incidencias.html", {"request": request})

@app.get("/recomendaciones", response_class=HTMLResponse)
def recomendaciones_page(request: Request):
    """Módulo de análisis y recomendaciones"""
    return templates.TemplateResponse("recomendaciones.html", {"request": request})