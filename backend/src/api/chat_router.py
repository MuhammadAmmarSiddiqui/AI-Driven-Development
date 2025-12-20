from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..models.query_model import ChatRequest, ContextualChatRequest
from ..services.rag_agent_service import RAGAgentService
from ..utils.error_handler import handle_error

chat_router = APIRouter()
rag_agent_service = RAGAgentService()

@chat_router.post("/chat", summary="General chat endpoint")
async def chat_endpoint(request: ChatRequest) -> Dict[str, Any]:
    """
    General chat endpoint for basic Q&A
    """
    try:
        # FIXED: Changed to async function and added 'await' since answer_query is now async
        response = await rag_agent_service.answer_query(
            query=request.query,
            top_k=5,
            include_sources=request.include_sources
        )

        if not response.success:
            raise HTTPException(status_code=500, detail="Failed to generate response")

        result = {
            "response": response.response,
            "query": response.query,
            "sources": response.sources if request.include_sources else [],
            "response_time": response.response_time,
            "session_id": request.session_id,
            "success": response.success,
            "timestamp": response.timestamp.isoformat()
        }

        return result
    except Exception as e:
        # Note: If handle_error is causing a KeyError, we will fix that in error_handler.py
        error_details = handle_error(e, "chat_endpoint")
        raise HTTPException(status_code=500, detail=error_details.get("message", "Internal Server Error"))

@chat_router.post("/selection-chat", summary="Contextual chat with selected text")
async def contextual_chat_endpoint(request: ContextualChatRequest) -> Dict[str, Any]:
    """
    Chat endpoint that prioritizes user-selected text in the context
    """
    try:
        # FIXED: Properly await the async answer_contextual_query method
        response = await rag_agent_service.answer_contextual_query(
            query=request.query,
            selected_text=request.selected_text,
            top_k=5
        )

        if not response.success:
            raise HTTPException(status_code=500, detail="Failed to generate contextual response")

        result = {
            "response": response.response,
            "query": response.query,
            "selected_text": request.selected_text,
            "sources": response.sources or [],  # Ensure sources is always a list, even if None
            "response_time": response.response_time,
            "session_id": response.session_id,
            "success": response.success,
            "timestamp": response.timestamp.isoformat()
        }

        return result
    except Exception as e:
        error_details = handle_error(e, "contextual_chat_endpoint")
        raise HTTPException(status_code=500, detail=error_details.get("message", "Internal Server Error"))

@chat_router.get("/chat-status", summary="Get chat service status")
def chat_status() -> Dict[str, Any]:
    try:
        # FIXED: Removed misleading comment - check_index_status is synchronous
        status = rag_agent_service.check_index_status()
        return status
    except Exception as e:
        error_details = handle_error(e, "chat_status")
        raise HTTPException(status_code=500, detail=error_details.get("message", "Internal Server Error"))

@chat_router.post("/validate-response", summary="Validate if response is grounded in context")
def validate_response(query: str, response: str, context: list[dict]) -> Dict[str, Any]:
    try:
        # FIXED: Removed misleading comment - validate_answer is synchronous
        validation_result = rag_agent_service.validate_answer(query, response, context)
        return validation_result
    except Exception as e:
        error_details = handle_error(e, "validate_response")
        raise HTTPException(status_code=500, detail=error_details.get("message", "Internal Server Error"))