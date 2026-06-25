"""
Task management API endpoints.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.database import get_database
from app.auth.dependencies import get_current_user
from app.tasks.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.tasks import service

router = APIRouter()


@router.post("/create", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new task."""
    db = get_database()
    task = await service.create_task(db, current_user["id"], task_data)
    return TaskResponse(**task)


@router.get("/list", response_model=TaskListResponse)
async def list_tasks(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: int = Query(-1),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
):
    """List user tasks with optional filters."""
    db = get_database()
    tasks, total = await service.get_tasks(
        db, current_user["id"], status, category, sort_by, sort_order, limit, skip
    )
    return TaskListResponse(tasks=[TaskResponse(**t) for t in tasks], total=total)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single task by ID."""
    db = get_database()
    task = await service.get_task_by_id(db, task_id, current_user["id"])
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**task)


@router.put("/update/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    update_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a task."""
    db = get_database()
    task = await service.update_task(db, task_id, current_user["id"], update_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**task)


@router.delete("/delete/{task_id}")
async def delete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a task."""
    db = get_database()
    deleted = await service.delete_task(db, task_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a task as completed."""
    db = get_database()
    task = await service.complete_task(db, task_id, current_user["id"])
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**task)


@router.patch("/{task_id}/postpone", response_model=TaskResponse)
async def postpone_task(
    task_id: str,
    new_deadline: datetime = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """Postpone a task to a new deadline."""
    db = get_database()
    task = await service.postpone_task(db, task_id, current_user["id"], new_deadline)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**task)
