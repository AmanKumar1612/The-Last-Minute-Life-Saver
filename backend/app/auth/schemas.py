"""
Pydantic schemas for authentication.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    profession: Optional[str] = None
    productivity_goals: Optional[List[str]] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    profession: Optional[str] = None
    productivity_goals: Optional[List[str]] = []
    created_at: datetime


class UserInDB(BaseModel):
    id: str
    name: str
    email: str
    hashed_password: str
    profession: Optional[str] = None
    productivity_goals: Optional[List[str]] = []
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UpdateProfile(BaseModel):
    name: Optional[str] = None
    profession: Optional[str] = None
    productivity_goals: Optional[List[str]] = None
