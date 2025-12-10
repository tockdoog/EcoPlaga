# Usa Python 3.11 como imagen base
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de requisitos
COPY requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el proyecto
COPY . .

# Expone el puerto 8000
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]