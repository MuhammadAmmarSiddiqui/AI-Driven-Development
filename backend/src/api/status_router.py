from fastapi import APIRouter
from typing import Dict, Any
from ..services.indexing_service import IndexingService
from ..services.retrieval_service import RetrievalService
from ..utils.error_handler import handle_error

status_router = APIRouter()

@status_router.get("/index-status", summary="Get index status")
async def get_index_status() -> Dict[str, Any]:
    """
    Get the status of the indexing system
    """
    try:
        indexing_service = IndexingService()
        status = indexing_service.get_index_status()
        return status
    except Exception as e:
        error_details = handle_error(e, "get_index_status")
        return {
            "status": "error",
            "error": error_details["message"],
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }

@status_router.get("/retrieval-status", summary="Get retrieval system status")
async def get_retrieval_status() -> Dict[str, Any]:
    """
    Get the status of the retrieval system
    """
    try:
        retrieval_service = RetrievalService()
        is_available = retrieval_service.validate_index_availability()

        return {
            "status": "available" if is_available else "unavailable",
            "service": "retrieval",
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        error_details = handle_error(e, "get_retrieval_status")
        return {
            "status": "error",
            "error": error_details["message"],
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }

@status_router.get("/overall-status", summary="Get overall system status")
async def get_overall_status() -> Dict[str, Any]:
    """
    Get the overall status of the RAG system
    """
    try:
        indexing_service = IndexingService()
        retrieval_service = RetrievalService()

        index_status = indexing_service.get_index_status()
        retrieval_available = retrieval_service.validate_index_availability()

        # Determine overall status
        overall_status = "healthy"
        if not retrieval_available:
            overall_status = "index_not_available"

        return {
            "status": overall_status,
            "index": index_status,
            "retrieval_available": retrieval_available,
            "services": {
                "indexing": "ready",
                "retrieval": "available" if retrieval_available else "not_available",
            },
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        error_details = handle_error(e, "get_overall_status")
        return {
            "status": "error",
            "error": error_details["message"],
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }