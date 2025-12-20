from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class ContentExtractionRequest(BaseModel):
    """
    Model for API request to extract content from documents
    """
    source_path: str
    file_type: str  # e.g., 'pdf', 'txt', 'md', 'docx'
    metadata: Optional[Dict[str, Any]] = None

class ContentExtractionResponse(BaseModel):
    """
    Model for API response containing extracted content
    """
    source_path: str
    extracted_text: str
    page_count: Optional[int] = None
    word_count: int
    metadata: Optional[Dict[str, Any]] = None
    extraction_time: float
    success: bool = True
    message: str = "Content extracted successfully"

class ContentProcessingRequest(BaseModel):
    """
    Model for API request to process content for indexing
    """
    text: str
    source: str
    chunk_size: int = 1000
    chunk_overlap: int = 200
    metadata: Optional[Dict[str, Any]] = None

class ContentProcessingResponse(BaseModel):
    """
    Model for API response containing processed content
    """
    source: str
    total_chunks: int
    processed_chunks: List[Dict[str, Any]]
    processing_time: float
    success: bool = True
    message: str = "Content processed successfully"

class DocumentMetadata(BaseModel):
    """
    Model for document metadata
    """
    source: str
    title: Optional[str] = None
    author: Optional[str] = None
    created_date: Optional[datetime] = None
    modified_date: Optional[datetime] = None
    file_size: Optional[int] = None
    page_count: Optional[int] = None
    word_count: Optional[int] = None
    language: Optional[str] = "en"
    tags: List[str] = []
    custom_metadata: Optional[Dict[str, Any]] = None