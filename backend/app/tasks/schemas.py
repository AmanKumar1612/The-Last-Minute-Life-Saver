"""
Pydantic schemas for task management.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class TaskImportance(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskCategory(str, Enum):
    WORK = "work"
    STUDY = "study"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    OTHER = "other"


class SubtaskSchema(BaseModel):
    title: str
    estimated_hours: Optional[float] = None
    completed: bool = False
    dependency: Optional[str] = None  # title of prerequisite subtask


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = Field(None, ge=0)
    importance: TaskImportance = TaskImportance.MEDIUM
    category: TaskCategory = TaskCategory.OTHER
    subtasks: Optional[List[SubtaskSchema]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    importance: Optional[TaskImportance] = None
    category: Optional[TaskCategory] = None
    status: Optional[TaskStatus] = None
    subtasks: Optional[List[SubtaskSchema]] = None


class TaskResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    importance: str
    category: str
    status: str
    priority_score: Optional[float] = None
    priority_label: Optional[str] = None
    risk_percentage: Optional[float] = None
    subtasks: List[SubtaskSchema] = []
    postponement_count: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
