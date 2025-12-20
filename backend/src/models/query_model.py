from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class UserQuery(BaseModel):
    """
    Model representing a user query
    """
    query: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime = datetime.now()

class ChatResponse(BaseModel):
    """
    Model for chat response
    """
    response: str
    query: str
    session_id: Optional[str] = None
    sources: List[Dict[str, Any]] = []
    response_time: float = 0.0
    success: bool = True
    timestamp: datetime = datetime.now()

class ChatRequest(BaseModel):
    """
    Model for chat API request
    """
    query: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    include_sources: bool = True
    max_tokens: int = 500
    temperature: float = 0.7
    metadata: Optional[Dict[str, Any]] = None

class ContextualChatRequest(ChatRequest):
    """
    Enhanced chat request model that supports contextual mode with selected text
    """
    selected_text: Optional[str] = None
    context_priority: bool = True  # Whether to prioritize the selected text in context

class SessionChatRequest(ChatRequest):
    """
    Chat request model with additional session management features
    """
    new_session: bool = False  # Whether to start a new session
    history_size: int = 10  # Number of previous messages to include in context

class ValidationRequest(BaseModel):
    """
    Model for validation requests
    """
    query: str
    response: str
    context: List[Dict[str, Any]]
    validation_criteria: Optional[Dict[str, Any]] = None