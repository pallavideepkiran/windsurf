from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .database import Base, engine
from .routers import logs


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (simple MVP, replace with Alembic later)
    # Allow tests to skip DB initialization by setting SKIP_DB_CREATE=1
    if os.getenv("SKIP_DB_CREATE") != "1":
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Identity Mirror Agent API", version="0.1.0", lifespan=lifespan)

# CORS (adjust origins for your frontend dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(logs.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
