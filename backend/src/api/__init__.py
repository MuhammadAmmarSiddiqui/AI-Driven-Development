# API module initialization
from .indexing_router import indexing_router
from .retrieval_router import retrieval_router
from .chat_router import chat_router
from .health_router import health_router
from .status_router import status_router

__all__ = [
    "indexing_router",
    "retrieval_router",
    "chat_router",
    "health_router",
    "status_router"
]