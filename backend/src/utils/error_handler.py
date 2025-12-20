import logging
from fastapi import HTTPException, status
from typing import Dict, Any
import traceback
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class RAGException(Exception):
    """Base exception class for RAG-related errors"""
    def __init__(self, message: str, error_code: str = "RAG_ERROR", details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.timestamp = datetime.now()
        super().__init__(self.message)

class DocumentIndexingError(RAGException):
    """Exception raised when document indexing fails"""
    def __init__(self, message: str = "Document indexing failed", details: Dict[str, Any] = None):
        super().__init__(message, "DOCUMENT_INDEXING_ERROR", details)

class RetrievalError(RAGException):
    """Exception raised when content retrieval fails"""
    def __init__(self, message: str = "Content retrieval failed", details: Dict[str, Any] = None):
        super().__init__(message, "RETRIEVAL_ERROR", details)

class GenerationError(RAGException):
    """Exception raised when response generation fails"""
    def __init__(self, message: str = "Response generation failed", details: Dict[str, Any] = None):
        super().__init__(message, "GENERATION_ERROR", details)

def handle_error(exception: Exception, context: str = "") -> Dict[str, Any]:
    """
    Standardized error handling function.
    Fixed: Renamed keys to avoid 'message' and 'type' conflicts in Python LogRecord.
    """
    # We rename 'message' to 'exception_msg' to avoid the LogRecord KeyError
    log_extra = {
        "exception_type": type(exception).__name__,
        "exception_msg": str(exception),
        "error_context": context,
        "timestamp": datetime.now().isoformat(),
        "trace_info": traceback.format_exc() if hasattr(exception, '__traceback__') else None
    }

    # Log the error using the safe keys
    logger.error(f"Error in {context}: {str(exception)}", extra=log_extra)

    # Return a dictionary that is safe for the API response
    # It is okay to use "message" here as it's a JSON response, not a LogRecord
    return {
        "type": log_extra["exception_type"],
        "message": log_extra["exception_msg"],
        "context": context,
        "timestamp": log_extra["timestamp"]
    }

def create_http_exception(
    status_code: int,
    detail: str,
    headers: Dict[str, str] = None
) -> HTTPException:
    """
    Create a standardized HTTP exception
    """
    return HTTPException(
        status_code=status_code,
        detail=detail,
        headers=headers
    )

def log_api_call(
    endpoint: str,
    method: str,
    user_id: str = None,
    params: Dict[str, Any] = None,
    response_time: float = None
) -> None:
    """
    Log API calls for monitoring and debugging
    """
    log_data = {
        "api_endpoint": endpoint,
        "api_method": method,
        "user_id": user_id,
        "api_params": params,
        "response_time_ms": response_time,
        "call_timestamp": datetime.now().isoformat()
    }

    logger.info(f"API call: {method} {endpoint}", extra=log_data)

def add_exception_handlers(app):
    """
    Add standardized exception handlers to FastAPI app
    """
    from fastapi.responses import JSONResponse

    @app.exception_handler(RAGException)
    async def handle_rag_exception(request, exc):
        logger.error(f"RAG Exception: {exc.message}", extra={
            "error_code": exc.error_code,
            "error_details": exc.details,
            "request_path": str(request.url)
        })

        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "type": exc.error_code,
                    "message": exc.message,
                    "details": exc.details,
                    "timestamp": exc.timestamp.isoformat()
                }
            }
        )

    @app.exception_handler(Exception)
    async def handle_general_exception(request, exc):
        error_details = handle_error(exc, f"Unhandled exception at {request.url.path}")

        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "type": "INTERNAL_ERROR",
                    "message": "An internal error occurred",
                    "details": error_details
                }
            }
        )

if __name__ == "__main__":
    # Test error logging
    try:
        raise DocumentIndexingError("Failed to index document", {"document_id": "123", "source": "book.pdf"})
    except DocumentIndexingError as e:
        print(f"Caught exception: {e.message}")
        handle_error(e, "Test Context")