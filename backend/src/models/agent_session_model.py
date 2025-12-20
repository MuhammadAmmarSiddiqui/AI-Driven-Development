from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class AgentSession(BaseModel):
    """
    Model representing an agent session
    """
    session_id: str
    user_id: Optional[str] = None
    conversation_history: List[Dict[str, Any]] = []
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    is_active: bool = True

    class Config:
        # Allow extra fields in case additional metadata is provided
        extra = "allow"

class AgentSessionRequest(BaseModel):
    """
    Model for API request to create or update a session
    """
    session_id: str
    user_id: Optional[str] = None
    initial_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AgentSessionResponse(BaseModel):
    """
    Model for API response containing session information
    """
    session_id: str
    user_id: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    message: str = "Session created successfully"