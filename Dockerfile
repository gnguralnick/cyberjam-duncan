FROM node:18-alpine AS build

WORKDIR /frontend

RUN npm install -g pnpm

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install

COPY .env.production frontend/.env

COPY frontend/ .

RUN pnpm build

FROM python:3.11-slim

WORKDIR /backend

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 -y

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY .env.production .env

COPY backend/ .

COPY --from=build /frontend/dist static

EXPOSE 8000

# CMD ["fastapi", "run", "app/main.py", "--port", "8000"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

