from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class BookContentChunk(BaseModel):
    """
    Model representing a chunk of book content
    """
    id: str
    text: str
    source: str
    page: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    chunk_id: str
    length: int
    embedding_vector: Optional[list] = None  # Optional since embedding might be computed later
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Config:
        # Allow extra fields in case additional metadata is provided
        extra = "allow"

class ChunkResponse(BaseModel):
    """
    Model for API response containing chunks
    """
    chunks: list[BookContentChunk]
    total_chunks: int
    processing_time: float

class ChunkRequest(BaseModel):
    """
    Model for API request to create chunks
    """
    text: str
    source: str
    metadata: Optional[Dict[str, Any]] = None
    chunk_size: int = 1000
    chunk_overlap: int = 200