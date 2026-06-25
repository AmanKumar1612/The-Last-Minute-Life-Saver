"""
Task CRUD service layer.
"""

from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.tasks.schemas import TaskCreate, TaskUpdate, TaskStatus


async def create_task(db: AsyncIOMotorDatabase, user_id: str, task_data: TaskCreate) -> dict:
    """Create a new task."""
    task_doc = {
        "user_id": user_id,
        "title": task_data.title,
        "description": task_data.description,
        "deadline": task_data.deadline,
        "estimated_hours": task_data.estimated_hours,
        "importance": task_data.importance.value,
        "category": task_data.category.value,
        "status": TaskStatus.PENDING.value,
        "priority_score": None,
        "priority_label": None,
        "risk_percentage": None,
        "subtasks": [s.model_dump() for s in (task_data.subtasks or [])],
        "postponement_count": 0,
        "created_at": datetime.now(timezone.utc),
        "completed_at": None,
    }

    result = await db.tasks.insert_one(task_doc)
    task_doc["_id"] = result.inserted_id
    return _format_task(task_doc)


async def get_tasks(
    db: AsyncIOMotorDatabase,
    user_id: str,
    status: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: str = "priority_score",
    sort_order: int = -1,
    limit: int = 50,
    skip: int = 0,
) -> tuple[List[dict], int]:
    """Get user tasks with filters and sorting."""
    query = {"user_id": user_id}

    if status:
        query["status"] = status
    if category:
        query["category"] = category

    # Handle null priority scores — put them last
    sort_field = sort_by if sort_by in ["deadline", "created_at", "priority_score", "importance"] else "created_at"

    total = await db.tasks.count_documents(query)
    cursor = db.tasks.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)
    tasks = await cursor.to_list(length=limit)

    return [_format_task(t) for t in tasks], total


async def get_task_by_id(db: AsyncIOMotorDatabase, task_id: str, user_id: str) -> Optional[dict]:
    """Get a single task by ID."""
    task = await db.tasks.find_one({"_id": ObjectId(task_id), "user_id": user_id})
    return _format_task(task) if task else None


async def update_task(
    db: AsyncIOMotorDatabase, task_id: str, user_id: str, update_data: TaskUpdate
) -> Optional[dict]:
    """Update a task."""
    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}

    # Convert enums to values
    if "importance" in update_fields:
        update_fields["importance"] = update_fields["importance"].value
    if "category" in update_fields:
        update_fields["category"] = update_fields["category"].value
    if "status" in update_fields:
        update_fields["status"] = update_fields["status"].value
    if "subtasks" in update_fields:
        update_fields["subtasks"] = [s.model_dump() if hasattr(s, "model_dump") else s for s in update_fields["subtasks"]]

    if not update_fields:
        return None

    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {"$set": update_fields},
        return_document=True,
    )
    return _format_task(result) if result else None


async def delete_task(db: AsyncIOMotorDatabase, task_id: str, user_id: str) -> bool:
    """Delete a task."""
    result = await db.tasks.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
    return result.deleted_count > 0


async def complete_task(db: AsyncIOMotorDatabase, task_id: str, user_id: str) -> Optional[dict]:
    """Mark a task as completed."""
    now = datetime.now(timezone.utc)
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {"$set": {"status": TaskStatus.COMPLETED.value, "completed_at": now}},
        return_document=True,
    )

    if result:
        # Log analytics event
        await db.analytics_events.insert_one({
            "user_id": user_id,
            "event_type": "task_completed",
            "task_id": task_id,
            "timestamp": now,
            "was_overdue": result.get("deadline") and result["deadline"] < now,
        })

    return _format_task(result) if result else None


async def postpone_task(db: AsyncIOMotorDatabase, task_id: str, user_id: str, new_deadline: datetime) -> Optional[dict]:
    """Postpone a task — increments postponement counter."""
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {
            "$set": {"deadline": new_deadline},
            "$inc": {"postponement_count": 1},
        },
        return_document=True,
    )
    return _format_task(result) if result else None


async def get_user_completion_stats(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """Get user completion statistics for AI modules."""
    total = await db.tasks.count_documents({"user_id": user_id})
    completed = await db.tasks.count_documents({"user_id": user_id, "status": TaskStatus.COMPLETED.value})
    overdue = await db.tasks.count_documents({"user_id": user_id, "status": TaskStatus.OVERDUE.value})

    # Average postponement count
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": None, "avg_postponement": {"$avg": "$postponement_count"}}},
    ]
    result = await db.tasks.aggregate(pipeline).to_list(1)
    avg_postponement = result[0]["avg_postponement"] if result else 0

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "overdue_tasks": overdue,
        "completion_rate": completed / total if total > 0 else 0,
        "avg_postponement": avg_postponement,
    }


def _format_task(task_doc: dict) -> dict:
    """Format MongoDB document to response dict."""
    return {
        "id": str(task_doc["_id"]),
        "user_id": task_doc["user_id"],
        "title": task_doc["title"],
        "description": task_doc.get("description"),
        "deadline": task_doc.get("deadline"),
        "estimated_hours": task_doc.get("estimated_hours"),
        "importance": task_doc.get("importance", "medium"),
        "category": task_doc.get("category", "other"),
        "status": task_doc.get("status", "pending"),
        "priority_score": task_doc.get("priority_score"),
        "priority_label": task_doc.get("priority_label"),
        "risk_percentage": task_doc.get("risk_percentage"),
        "subtasks": task_doc.get("subtasks", []),
        "postponement_count": task_doc.get("postponement_count", 0),
        "created_at": task_doc["created_at"],
        "completed_at": task_doc.get("completed_at"),
    }
