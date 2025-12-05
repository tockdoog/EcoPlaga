Flujo:

                      ┌───────────────────────┐
                      │      INICIO            │
                      └───────────┬───────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ ¿Usuario tiene cuenta?     │
                    └─────────────┬──────────────┘
                          Sí       │      No
                                   │
                     ┌─────────────▼────────────┐
                     │   Registro de Usuario    │
                     └─────────────┬────────────┘
                                   │
                         ┌─────────▼───────────┐
                         │      Login           │
                         └─────────┬───────────┘
                                   │  (JWT)
                           ┌───────▼──────────┐
                           │   Menú Principal  │
                           └───┬─────┬─────┬──┘
                               │     │     │
            ┌──────────────────▼     │     ▼────────────────────┐
            │      Gestión de Cultivos │      Gestión de Plagas │
            └──────────────────┬───────┘───────┬────────────────┘
                               │               │
             ┌─────────────────▼────────┐   ┌──▼──────────────────┐
             │   CRUD Cultivos          │   │ CRUD Plagas          │
             └───────────────┬─────────┘   └──────────────┬───────┘
                             │                            │
                     ┌───────▼──────────┐        ┌────────▼─────────┐
                     │ Registro Incidencia │       │ Registro Tratamiento │
                     └────────┬──────────┘        └─────────┬───────────┘
                              │                               │
                 ┌────────────▼────────────┐        ┌────────▼─────────┐
                 │   Base de datos actualiza │        │ BD actualiza     │
                 └───────────┬──────────────┘        └─────────┬────────┘
                             │                               │
                     ┌───────▼──────────────┐      ┌──────────▼─────────┐
                     │  Módulo Análisis (Pandas) │    │  Dashboard / Reportes │
                     └─────────┬─────────────┘      └──────────┬─────────┘
                               │                                 │
                         ┌─────▼─────┐                ┌─────────▼────────┐
                         │ Alertas    │                │ Recomendaciones   │
                         └─────┬──────┘                └─────────┬────────┘
                               │                                 │
                          ┌────▼────┐                     ┌──────▼──────┐
                          │  FIN     │                     │ Descarga CSV │
                          └─────────┘                     └─────────────┘



base de datos:
┌───────────┐        ┌─────────────┐
│  Usuarios │        │   Cultivos  │
├───────────┤        ├─────────────┤
│ id (PK)   │◄───────│ id (PK)     │
│ nombre    │        │ nombre      │
│ email     │        │ ubicacion   │
│ password  │        │ tipo_suelo  │
│ rol       │        │ usuario_id  │ FK -> Usuarios.id
└───────────┘        └─────────────┘
       │
       │
       │
       ▼
┌─────────────┐
│   Plagas    │
├─────────────┤
│ id (PK)     │
│ nombre      │
│ descripcion │
│ nivel_riesgo│
└─────────────┘
       │
       │
       │
       ▼
┌──────────────┐
│ Incidencias  │
├──────────────┤
│ id (PK)      │
│ cultivo_id   │ FK -> Cultivos.id
│ plaga_id     │ FK -> Plagas.id
│ fecha        │
│ severidad    │
│ observaciones│
└──────────────┘
       │
       │
       ▼
┌──────────────┐
│ Tratamientos │
├──────────────┤
│ id (PK)      │
│ incidencia_id│ FK -> Incidencias.id
│ producto     │
│ fecha        │
│ efectividad  │
└──────────────┘



Estructura:
                    ┌─────────────┐
                    │   Usuario   │
                    │ (Frontend)  │
                    │ HTML/CSS/JS │
                    └───────┬─────┘
                            │
                ┌───────────▼────────────┐
                │      Dashboard / UI    │
                │  Gráficos (Chart.js)  │
                └───────────┬────────────┘
                            │ fetch / API
                            │
                     ┌──────▼─────────┐
                     │   Backend       │
                     │   FastAPI       │
                     │ - Routers       │
                     │ - Services      │
                     │ - Auth JWT      │
                     └──────┬─────────┘
                            │ ORM / SQLAlchemy
                            │
                  ┌─────────▼────────────┐
                  │   Base de Datos      │
                  │    PostgreSQL        │
                  │  Tablas: Usuarios,   │
                  │  Cultivos, Plagas,   │
                  │  Incidencias,        │
                  │  Tratamientos        │
                  └─────────┬────────────┘
                            │
                 ┌──────────▼─────────────┐
                 │  Analítica / Data      │
                 │ Pandas / Numpy         │
                 │ Reportes / Alertas     │
                 └───────────────────────┘


Flujo:
El usuario interactúa con frontend.
Frontend llama al backend FastAPI mediante fetch/HTTP.
Backend consulta la base de datos usando ORM y realiza validaciones.
Los datos se envían al frontend y se procesan con Pandas/Numpy para estadísticas y alertas.
Los resultados se muestran en dashboard y pueden exportarse como reportes CSV/Excel.