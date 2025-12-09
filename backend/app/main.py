import uvicorn 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import init_db
from app.routers import rooms, autocomplete, websocket

settings = get_settings()
uvicorn.config.Config.ws_per_message_deflate = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup
    await init_db()
    print("Database initialized successfully")
    yield
    # Shutdown
    print("Application shutting down")


# Create FastAPI application
app = FastAPI(
    title="Collaborative Code Editor API",
    description="Real-time pair-programming API with WebSocket support",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(rooms.router)
app.include_router(autocomplete.router)
app.include_router(websocket.router)


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "status": "healthy",
        "message": "Collaborative Code Editor API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

