from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from fastapi.staticfiles import StaticFiles

from starlette.exceptions import HTTPException as StarletteHTTPException

load_dotenv(override=True)

app = FastAPI(title="root app")

api_app = FastAPI(title="api app")

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS"),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@api_app.get('/')
def root():
    return {'message': 'Hello World'}

app.mount("/api", api_app)

# Serve Frontend

app.mount("/", StaticFiles(directory="static", html=True), name="frontend")