"""
FastAPI application entry point.
"""

import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.auth.router import router as auth_router
from app.tasks.router import router as tasks_router
from app.ai.router import router as ai_router
from app.goals.router import router as goals_router
from app.analytics.router import router as analytics_router
from app.calendar.router import router as calendar_router
from app.notifications.router import router as notifications_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown events."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="The Last-Minute Life Saver",
    description="AI-powered productivity companion API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions so they return JSON with CORS headers."""
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
app.include_router(ai_router, prefix="/ai", tags=["AI"])
app.include_router(goals_router, prefix="/goals", tags=["Goals"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(calendar_router, prefix="/calendar", tags=["Calendar"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])


@app.get("/")
async def root():
    return {
        "app": "The Last-Minute Life Saver",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
