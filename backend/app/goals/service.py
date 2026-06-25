"""
Goal CRUD service with AI-powered milestone generation.
"""

import json
from datetime import datetime, timezone
from typing import Optional, List
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from google import genai
from app.config import get_settings

settings = get_settings()


async def create_goal(db: AsyncIOMotorDatabase, user_id: str, goal_data: dict) -> dict:
    """Create a new goal."""
    goal_doc = {
        "user_id": user_id,
        "title": goal_data["title"],
        "description": goal_data.get("description"),
        "target_date": goal_data.get("target_date"),
        "milestones": [m if isinstance(m, dict) else m.model_dump() for m in (goal_data.get("milestones") or [])],
        "progress": 0.0,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.goals.insert_one(goal_doc)
    goal_doc["_id"] = result.inserted_id
    return _format_goal(goal_doc)


async def get_goals(db: AsyncIOMotorDatabase, user_id: str) -> List[dict]:
    """Get all user goals with computed progress."""
    cursor = db.goals.find({"user_id": user_id}).sort("created_at", -1)
    goals = await cursor.to_list(length=50)

    results = []
    for g in goals:
        milestones = g.get("milestones", [])
        completed = sum(1 for m in milestones if m.get("completed"))
        progress = (completed / len(milestones) * 100) if milestones else 0

        await db.goals.update_one({"_id": g["_id"]}, {"$set": {"progress": progress}})
        g["progress"] = progress
        results.append(_format_goal(g))

    return results


async def update_goal(db: AsyncIOMotorDatabase, goal_id: str, user_id: str, update_data: dict) -> Optional[dict]:
    """Update a goal."""
    update_fields = {k: v for k, v in update_data.items() if v is not None}
    if "milestones" in update_fields:
        update_fields["milestones"] = [m if isinstance(m, dict) else m.model_dump() for m in update_fields["milestones"]]

    if not update_fields:
        return None

    result = await db.goals.find_one_and_update(
        {"_id": ObjectId(goal_id), "user_id": user_id},
        {"$set": update_fields},
        return_document=True,
    )
    return _format_goal(result) if result else None


async def delete_goal(db: AsyncIOMotorDatabase, goal_id: str, user_id: str) -> bool:
    """Delete a goal."""
    result = await db.goals.delete_one({"_id": ObjectId(goal_id), "user_id": user_id})
    return result.deleted_count > 0


async def ai_generate_milestones(title: str, description: Optional[str] = None) -> List[dict]:
    """Use Gemini to break a goal into milestones."""
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""Break this goal into 5-8 concrete milestones. Each milestone should be measurable and achievable.

Goal: {title}
{f"Description: {description}" if description else ""}

Return a JSON array:
[
  {{"title": "Milestone description (measurable)", "completed": false, "target_date": null}},
  ...
]

Rules:
1. Order from first to last
2. Make each milestone specific and measurable
3. Include learning, practice, and assessment milestones
4. Return ONLY the JSON array, no markdown
"""

    try:
        response = client.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        return json.loads(text)
    except Exception as e:
        print(f"Milestone generation error: {e}")
        return [
            {"title": f"Research and plan: {title}", "completed": False, "target_date": None},
            {"title": "Set up resources and tools", "completed": False, "target_date": None},
            {"title": "Complete first major milestone", "completed": False, "target_date": None},
            {"title": "Review progress and adjust", "completed": False, "target_date": None},
            {"title": "Finalize and achieve goal", "completed": False, "target_date": None},
        ]


def _format_goal(goal_doc: dict) -> dict:
    return {
        "id": str(goal_doc["_id"]),
        "user_id": goal_doc["user_id"],
        "title": goal_doc["title"],
        "description": goal_doc.get("description"),
        "target_date": goal_doc.get("target_date"),
        "milestones": goal_doc.get("milestones", []),
        "progress": goal_doc.get("progress", 0.0),
        "created_at": goal_doc["created_at"],
    }
