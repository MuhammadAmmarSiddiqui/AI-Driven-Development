from fastapi import APIRouter
from typing import Dict, Any
from ..services.agent_service import AgentService
from ..services.retrieval_service import RetrievalService
from ..utils.error_handler import handle_error

health_router = APIRouter()

@health_router.get("/health", summary="Health check endpoint")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify all services are running
    """
    try:
        # Check if agent service is accessible
        agent_service = AgentService()
        agent_healthy = agent_service.validate_api_connection()

        # Check if retrieval service is accessible
        retrieval_service = RetrievalService()
        retrieval_healthy = retrieval_service.validate_index_availability()

        overall_health = agent_healthy and retrieval_healthy

        return {
            "status": "healthy" if overall_health else "unhealthy",
            "details": {
                "agent_service": "healthy" if agent_healthy else "unhealthy",
                "retrieval_service": "healthy" if retrieval_healthy else "unhealthy"
            },
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        error_details = handle_error(e, "health_check")
        return {
            "status": "error",
            "error": error_details["message"],
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }