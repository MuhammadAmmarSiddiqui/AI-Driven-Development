"""
API router for document upload functionality.
"""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from typing import Dict, Any, Optional
from src.services.docs_upload_service import DocsUploadService


docs_upload_router = APIRouter()
docs_upload_service = DocsUploadService()


@docs_upload_router.post("/docs/upload-all", summary="Upload all markdown docs to Qdrant")
async def upload_all_docs(
    background_tasks: BackgroundTasks,
    docs_directory: str = "frontend/docs",
    batch_size: int = 5,
    continue_from: Optional[str] = None
) -> Dict[str, Any]:
    """
    Upload all markdown files from the specified directory to Qdrant.
    This runs synchronously and may take several minutes for large collections.
    """
    try:
        result = docs_upload_service.upload_all_docs(
            docs_directory=docs_directory,
            batch_size=batch_size,
            continue_from=continue_from
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_upload_router.get("/docs/upload-status", summary="Get upload status")
async def get_upload_status(file_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Get the current status of the upload process.
    """
    try:
        return docs_upload_service.get_upload_status(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_upload_router.get("/docs/verify-upload", summary="Verify upload completion")
async def verify_upload_completion(docs_directory: str = "frontend/docs") -> Dict[str, Any]:
    """
    Verify that all files from the docs directory have been successfully uploaded.
    """
    try:
        return docs_upload_service.verify_upload_completion(docs_directory)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@docs_upload_router.post("/docs/resume-upload", summary="Resume interrupted upload")
async def resume_upload(
    docs_directory: str = "frontend/docs",
    continue_from: str = None,
    batch_size: int = 5
) -> Dict[str, Any]:
    """
    Resume an interrupted upload from a specific file.
    """
    if not continue_from:
        raise HTTPException(status_code=400, detail="continue_from parameter is required")

    try:
        result = docs_upload_service.upload_all_docs(
            docs_directory=docs_directory,
            batch_size=batch_size,
            continue_from=continue_from
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))