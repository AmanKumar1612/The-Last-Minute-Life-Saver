"""
Goals API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.auth.dependencies import get_current_user
from app.goals.schemas import GoalCreate, GoalUpdate, GoalResponse
from app.goals import service

router = APIRouter()


@router.post("/create", response_model=GoalResponse, status_code=201)
async def create_goal(
    goal_data: GoalCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new goal."""
    db = get_database()
    goal = await service.create_goal(db, current_user["id"], goal_data.model_dump())
    return GoalResponse(**goal)


@router.get("/list")
async def list_goals(current_user: dict = Depends(get_current_user)):
    """List all user goals with progress."""
    db = get_database()
    goals = await service.get_goals(db, current_user["id"])
    return {"goals": [GoalResponse(**g) for g in goals], "total": len(goals)}


@router.put("/update/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    update_data: GoalUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a goal."""
    db = get_database()
    goal = await service.update_goal(db, goal_id, current_user["id"], update_data.model_dump(exclude_unset=True))
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return GoalResponse(**goal)


@router.delete("/delete/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a goal."""
    db = get_database()
    deleted = await service.delete_goal(db, goal_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Goal deleted successfully"}


@router.post("/{goal_id}/generate-milestones")
async def generate_milestones(goal_id: str, current_user: dict = Depends(get_current_user)):
    """Use AI to generate milestones for a goal."""
    db = get_database()
    from bson import ObjectId

    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "user_id": current_user["id"]})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    milestones = await service.ai_generate_milestones(goal["title"], goal.get("description"))

    # Update goal with milestones
    await db.goals.update_one(
        {"_id": ObjectId(goal_id)},
        {"$set": {"milestones": milestones}},
    )

    return {"goal_id": goal_id, "milestones": milestones}
