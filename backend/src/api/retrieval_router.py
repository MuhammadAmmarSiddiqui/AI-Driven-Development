from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..models.context_model import RetrievalRequest, ContextAggregationRequest
from ..services.retrieval_service import RetrievalService
from ..utils.error_handler import handle_error

# 1. This variable name must exist for the import to work!
retrieval_router = APIRouter()
retrieval_service = RetrievalService()

@retrieval_router.post("/retrieve", summary="Retrieve relevant content")
async def retrieve_content(request: RetrievalRequest) -> Dict[str, Any]:
    try:
        # 2. Note the 'await' here because we made the service async
        result = await retrieval_service.retrieve_relevant_content(
            query=request.query,
            top_k=request.top_k,
            filters=request.filters
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])

        return result
    except Exception as e:
        error_details = handle_error(e, "retrieve_content")
        raise HTTPException(status_code=500, detail=error_details["message"])

@retrieval_router.post("/hybrid-search", summary="Perform hybrid search")
async def hybrid_search(query: str, keyword_weight: float = 0.3, top_k: int = 5) -> Dict[str, Any]:
    try:
        result = await retrieval_service.hybrid_search(query, keyword_weight, top_k)
        return result
    except Exception as e:
        error_details = handle_error(e, "hybrid_search")
        raise HTTPException(status_code=500, detail=error_details["message"])

@retrieval_router.get("/index-availability")
async def check_index_availability():
    is_available = await retrieval_service.validate_index_availability()
    return {"available": is_available}