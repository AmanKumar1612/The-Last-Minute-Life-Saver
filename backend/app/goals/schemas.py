"""
Pydantic schemas for goal tracking.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MilestoneSchema(BaseModel):
    title: str
    completed: bool = False
    target_date: Optional[datetime] = None


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    milestones: Optional[List[MilestoneSchema]] = []


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    milestones: Optional[List[MilestoneSchema]] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    milestones: List[MilestoneSchema] = []
    progress: float = 0.0
    created_at: datetime
