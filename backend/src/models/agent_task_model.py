from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskType(str, Enum):
    INDEXING = "indexing"
    RETRIEVAL = "retrieval"
    GENERATION = "generation"
    VALIDATION = "validation"

class AgentTask(BaseModel):
    """
    Model representing an agent task
    """
    task_id: str
    task_type: TaskType
    status: TaskStatus = TaskStatus.PENDING
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        # Allow extra fields in case additional metadata is provided
        extra = "allow"

class AgentTaskRequest(BaseModel):
    """
    Model for API request to create a task
    """
    task_type: TaskType
    input_data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class AgentTaskResponse(BaseModel):
    """
    Model for API response containing task information
    """
    task_id: str
    task_type: TaskType
    status: TaskStatus
    message: str
    created_at: datetime