from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import asyncio
from src.models.content_model import ContentExtractionRequest, ContentProcessingRequest
from src.services.indexing_service import IndexingService
from src.services.content_extraction_service import ContentExtractionService
from ..utils.error_handler import handle_error

indexing_router = APIRouter()
indexing_service = IndexingService()
content_extraction_service = ContentExtractionService()

@indexing_router.post("/index", summary="Index a document")
async def index_document(request: ContentExtractionRequest) -> Dict[str, Any]:
    """
    Index a document by extracting content, chunking, and storing in the vector database
    """
    try:
        result = indexing_service.index_document(
            source_path=request.source_path,
            metadata=request.metadata
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])

        return result
    except Exception as e:
        error_details = handle_error(e, "index_document")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.post("/index-batch", summary="Index multiple documents")
async def index_multiple_documents(source_paths: list[str]) -> Dict[str, Any]:
    """
    Index multiple documents in a batch operation
    """
    try:
        result = indexing_service.index_multiple_documents(source_paths)
        return result
    except Exception as e:
        error_details = handle_error(e, "index_multiple_documents")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.post("/index-text", summary="Index text content directly")
async def index_text_content(request: ContentProcessingRequest) -> Dict[str, Any]:
    """
    Index text content directly without file extraction
    """
    try:
        result = indexing_service.index_text_content(
            text=request.text,
            source=request.source,
            metadata=request.metadata
        )

        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])

        return result
    except Exception as e:
        error_details = handle_error(e, "index_text_content")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.post("/extract-content", summary="Extract content from document")
async def extract_content(request: ContentExtractionRequest) -> Dict[str, Any]:
    """
    Extract content from a document without indexing
    """
    try:
        result = content_extraction_service.process_book_content(
            source_path=request.source_path,
            chunk_size=request.chunk_size if hasattr(request, 'chunk_size') else 1000,
            chunk_overlap=request.chunk_overlap if hasattr(request, 'chunk_overlap') else 200
        )

        return {
            "source_path": request.source_path,
            "extracted_text_length": result["extracted_text_length"],
            "total_chunks": result["total_chunks"],
            "chunks_preview": result["chunks"][:2],  # Return first 2 chunks as preview
            "success": True,
            "message": "Content extracted successfully"
        }
    except Exception as e:
        error_details = handle_error(e, "extract_content")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.get("/index-status", summary="Get indexing service status")
async def get_index_status() -> Dict[str, Any]:
    """
    Get the status of the indexing service and vector database
    """
    try:
        result = indexing_service.get_index_status()
        return result
    except Exception as e:
        error_details = handle_error(e, "get_index_status")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.delete("/document/{source}", summary="Delete document from index")
async def delete_document(source: str) -> Dict[str, Any]:
    """
    Delete a document from the index by source
    """
    try:
        result = indexing_service.delete_document(source)
        if not result["success"]:
            # Return a warning instead of raising an exception for this endpoint
            return result
        return result
    except Exception as e:
        error_details = handle_error(e, "delete_document")
        raise HTTPException(status_code=500, detail=error_details["message"])

@indexing_router.put("/document/{source}", summary="Update document in index")
async def update_document(source: str, content: str = None) -> Dict[str, Any]:
    """
    Update an existing document in the index
    """
    try:
        # For now, this just re-indexs the document
        result = indexing_service.update_document(source, content)
        return result
    except Exception as e:
        error_details = handle_error(e, "update_document")
        raise HTTPException(status_code=500, detail=error_details["message"])