import os
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine
from app.routes import auth, teams, tasks, files, activity
from app.websockets.chat import sio

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Create database tables (Alembic handles this in production via start command)
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="TaskMate API",
    version="1.0.0",
    description="Backend API for the TaskMate team collaboration platform.",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.allowed_origins]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routers
app.include_router(auth.router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(teams.router,    prefix="/api/teams",    tags=["Teams"])
app.include_router(tasks.router,    prefix="/api/tasks",    tags=["Tasks"])
app.include_router(files.router,    prefix="/api/files",    tags=["Files"])
app.include_router(activity.router, prefix="/api/activity", tags=["Activity"])

# Static file serving for local uploads
app.mount("/uploads", StaticFiles(directory="uploads", html=False), name="uploads")


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "TaskMate API"}


# Wrap with Socket.io — this is the ASGI entry point used by uvicorn in production
# Start command: uvicorn app.main:socket_app --host 0.0.0.0 --port $PORT
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
