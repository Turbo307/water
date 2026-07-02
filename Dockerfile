#usar la imagen oficial de Python basada en linux alpine
FROM python:3.12-alpine

# establece variables de entorno para optimizar python en docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# crear y establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# instala dependencias del sistema necesarias para compilar paquetes de python
# (es util para bases de datos como postgreSQL o herramientas de imagenes)
RUN apk update && apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    jpeg-dev \
    zlib-dev \
    libjpeg

# copia el archivo de requerimientos e instalar las librerias de python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# copiar todo el codigo de tu proyecto al contenedor
COPY . /app/

# expone el puerto donde corre django por defecto
EXPOSE 8000

# comando para arrancar el servidor de desarrollo de django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]