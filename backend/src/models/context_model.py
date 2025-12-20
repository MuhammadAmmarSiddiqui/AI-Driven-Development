from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class RetrievedContext(BaseModel):
    """
    Model representing retrieved context from the vector database
    """
    id: str
    text: str
    source: str
    page: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    score: float  # Similarity score
    chunk_id: str
    relevance: float = 0.0  # Calculated relevance score

class RetrievedContextResponse(BaseModel):
    """
    Model for API response containing retrieved context
    """
    query: str
    contexts: List[RetrievedContext]
    total_results: int
    retrieval_time: float
    success: bool = True
    message: str = "Context retrieved successfully"

class RetrievalRequest(BaseModel):
    """
    Model for API request to retrieve context
    """
    query: str
    top_k: int = 5
    filters: Optional[Dict[str, Any]] = None
    min_score: float = 0.0

class ContextAggregationRequest(BaseModel):
    """
    Model for API request to aggregate multiple context sources
    """
    queries: List[str]
    top_k_per_query: int = 3
    max_total_contexts: int = 10
    filters: Optional[Dict[str, Any]] = None

class ContextAggregationResponse(BaseModel):
    """
    Model for API response containing aggregated context
    """
    original_queries: List[str]
    aggregated_contexts: List[RetrievedContext]
    total_aggregated: int
    aggregation_time: float
    success: bool = True
    message: str = "Context aggregated successfully"