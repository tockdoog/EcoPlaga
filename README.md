🌱 Ecoplagas – Plataforma de Gestión y Análisis de Plagas Agrícolas

📌 1. Descripción del Proyecto
Ecoplagas es una aplicación web full-stack que ayuda a pequeños y medianos agricultores a detectar, registrar y analizar la aparición de plagas en sus cultivos.
La plataforma permite gestionar cultivos, plagas, incidencias y tratamientos, generando estadísticas, alertas preventivas y reportes inteligentes utilizando Pandas y Numpy.

El proyecto surge desde una perspectiva de empatía, entendiendo las dificultades que enfrentan los agricultores: falta de control histórico, poca información sobre tratamientos y ausencia de herramientas digitales accesibles.

🎯 2. Formulación del Problema
Los agricultores suelen enfrentar pérdidas significativas debido a:
Falta de registro sistemático de plagas.
Dificultad para identificar patrones de infestación.
Ausencia de reportes históricos para decisiones preventivas.
Desconocimiento sobre la efectividad de los tratamientos aplicados.
Actualmente, muchos productores registran la información manualmente o simplemente no la llevan.

💡 3. Idea del Proyecto
Crear una plataforma web que permita:
Registrar cultivos, plagas, incidencias y tratamientos.
Visualizar datos mediante gráficos interactivos.
Analizar tendencias con Pandas y Numpy.
Generar alertas y recomendaciones según la frecuencia y severidad de plagas.
Todo en un entorno accesible, moderno y seguro.

🧭 4. Objetivo General
Desarrollar Ecoplagas como una plataforma web integral para gestionar, analizar y visualizar información sobre la aparición de plagas, con el fin de mejorar la toma de decisiones agrícolas y reducir pérdidas de cultivos.

🎯 5. Objetivos Específicos
Implementar un sistema CRUD para cultivos, plagas, incidencias y tratamientos.
Diseñar un módulo de autenticación seguro basado en JWT.
Analizar datos de incidencias utilizando Pandas y Numpy.
Visualizar información mediante gráficos interactivos en el dashboard.
Generar alertas y reportes exportables para facilitar la gestión agrícola.
Optimizar la experiencia del usuario con un frontend intuitivo.

🎯 6. Criterio SMART del Proyecto
| Criterio           | Descripción                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **S – Específico** | Crear Ecoplagas para gestionar plagas, incidencias y tratamientos con análisis inteligente. |
| **M – Medible**    | Implementar al menos 4 módulos CRUD, un dashboard con 3 gráficos y reportes con Pandas.     |
| **A – Alcanzable** | Se ajusta al tiempo académico usando FastAPI, JS, Pandas y una base de datos PostgreSQL.    |
| **R – Relevante**  | Responde a una necesidad real del agro, ayudando a reducir pérdidas productivas.            |
| **T – Temporal**   | Completar el proyecto en 6–8 semanas siguiendo hitos semanales.                             |


📌 7. ¿Qué? ¿Cómo? ¿Para qué?
¿Qué se va a hacer?
Desarrollar Ecoplagas, una plataforma web para registrar y analizar la aparición de plagas en cultivos.

¿Cómo se va a hacer?
Usando un stack full-stack: FastAPI, HTML/CSS/JS, Pandas/Numpy y PostgreSQL, con una arquitectura modular basada en buenas prácticas.

¿Para qué se va a hacer?
Para ayudar a agricultores a tomar decisiones preventivas, organizar su historial y mejorar el rendimiento de sus cultivos.


🏗️ 9. Tecnologías Utilizadas
Frontend: HTML5, CSS3, JavaScript, Chart.js
Backend: FastAPI
Base de Datos: PostgreSQL
Análisis de Datos: Pandas, Numpy
Control de Versiones: Git & GitHub
Extras: JWT, SQLAlchemy, Fetch API


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
