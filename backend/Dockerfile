FROM python:3.11-slim as base
WORKDIR /app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
COPY requirements.txt .

FROM base as development
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--ssl-keyfile", "/app/certs/key.pem", "--ssl-certfile", "/app/certs/cert.pem"]

FROM base as production
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]