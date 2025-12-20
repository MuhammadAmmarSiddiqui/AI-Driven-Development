from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from src.config import Config
from src.utils.error_handler import add_exception_handlers
import os
from dotenv import load_dotenv

load_dotenv()

# Import routers - Ensure these names match the 'variable' names in your router files
from src.api import (
    indexing_router,
    retrieval_router,
    chat_router,
    health_router,
    status_router
)

# Import Service to initialize it
from src.services.qdrant_service import QdrantService

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(Config.LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events: Handles startup and shutdown logic
    """
    logger.info(f"Starting {Config.APP_NAME} v{Config.APP_VERSION}")
    
    # 1. Initialize Qdrant Collection on startup
    try:
        qdrant_service = QdrantService()
        await qdrant_service._initialize_collection()
        logger.info("Successfully connected to Qdrant Cloud and verified collection.")
    except Exception as e:
        logger.error(f"Failed to initialize Qdrant on startup: {e}")
        # In production, you might want to prevent startup if the DB is down
    
    yield
    
    # 2. Shutdown logic
    logger.info(f"Shutting down {Config.APP_NAME}")
    # Close any open client connections here if necessary

# Create FastAPI app with lifespan
app = FastAPI(
    title=Config.APP_NAME,
    version=Config.APP_VERSION,
    debug=Config.DEBUG,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers (Renamed keys fix is inside here)
add_exception_handlers(app)

# Include API routers
app.include_router(indexing_router, prefix="/api", tags=["indexing"])
app.include_router(retrieval_router, prefix="/api", tags=["retrieval"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(status_router, prefix="/api", tags=["status"])

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {Config.APP_NAME} v{Config.APP_VERSION}",
        "status": "healthy",
        "debug": Config.DEBUG
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": Config.APP_NAME,
        "version": Config.APP_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG,
        log_level=Config.LOG_LEVEL.lower()
    )