# Usa una imagen base de Python 3.11
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos del backend
COPY backend/requirements.txt .

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código del backend
COPY backend/ .

# Copia el archivo de gestión de Django
COPY backend/manage.py .

# Ejecuta las migraciones
RUN python manage.py migrate --noinput || true

# Recolecta archivos estáticos (si los hay)
RUN python manage.py collectstatic --noinput || true

# Expone el puerto 8000
EXPOSE 8000

# Comando para iniciar el servidor
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
