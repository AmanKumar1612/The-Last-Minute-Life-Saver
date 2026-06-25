"""
AI module API endpoints.
"""

import json
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database import get_database
from app.auth.dependencies import get_current_user
from app.tasks.service import get_user_completion_stats
from app.ai.prioritizer import prioritize_all_tasks
from app.ai.breakdown import breakdown_task, store_subtasks
from app.ai.risk_predictor import analyze_all_tasks_risk
from app.ai.scheduler import generate_daily_plan
from app.ai.rescue import generate_rescue_plan
from app.ai.coach import detect_procrastination_patterns, generate_coaching_nudge
from app.ai.agents import run_crew_analysis

router = APIRouter()


# ─── Request Schemas ───────────────────────

class RescuePlanRequest(BaseModel):
    deadline: datetime
    tasks: List[dict] = Field(..., description="List of {title, estimated_hours}")
    available_hours: float
    start_time: Optional[str] = None


class ScheduleRequest(BaseModel):
    date: Optional[str] = None
    available_hours: float = 8.0
    start_hour: int = 9
    end_hour: int = 22


class VoiceQueryRequest(BaseModel):
    text: str


# ─── Endpoints ─────────────────────────────

@router.post("/prioritize")
async def prioritize_tasks(current_user: dict = Depends(get_current_user)):
    """Recalculate priority scores for all user tasks."""
    db = get_database()
    results = await prioritize_all_tasks(db, current_user["id"])
    return {"tasks": results, "total": len(results)}


@router.post("/breakdown/{task_id}")
async def breakdown_task_endpoint(
    task_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Break a task into AI-generated subtasks."""
    db = get_database()
    from bson import ObjectId

    task = await db.tasks.find_one({"_id": ObjectId(task_id), "user_id": current_user["id"]})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtasks = await breakdown_task(
        title=task["title"],
        description=task.get("description"),
        estimated_hours=task.get("estimated_hours"),
        category=task.get("category", "other"),
    )

    # Store in MongoDB
    await store_subtasks(db, task_id, current_user["id"], subtasks)

    return {"task_id": task_id, "subtasks": subtasks}


@router.post("/risk-analysis")
async def risk_analysis(current_user: dict = Depends(get_current_user)):
    """Analyze deadline risk for all pending tasks."""
    db = get_database()
    results = await analyze_all_tasks_risk(db, current_user["id"])
    return {"analysis": results, "total": len(results)}


@router.post("/schedule")
async def smart_schedule(
    request: ScheduleRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate an AI-optimized daily plan."""
    db = get_database()

    # Get prioritized tasks
    tasks = await prioritize_all_tasks(db, current_user["id"])

    # Try to get Google Calendar events
    calendar_events = None
    try:
        user_doc = await db.users.find_one({"email": current_user["email"]})
        if user_doc and user_doc.get("google_calendar_token"):
            from app.calendar.google_cal import get_events
            calendar_events = await get_events(user_doc["google_calendar_token"], request.date)
    except Exception:
        pass  # Calendar integration is optional

    plan = await generate_daily_plan(
        tasks=tasks,
        calendar_events=calendar_events,
        available_hours=request.available_hours,
        start_hour=request.start_hour,
        end_hour=request.end_hour,
        date=request.date,
    )

    return plan


@router.post("/rescue-plan")
async def rescue_plan(
    request: RescuePlanRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate an emergency rescue plan."""
    plan = await generate_rescue_plan(
        deadline=request.deadline,
        tasks=request.tasks,
        available_hours=request.available_hours,
        start_time=request.start_time,
    )
    return plan


@router.post("/coach")
async def coaching_nudge(current_user: dict = Depends(get_current_user)):
    """Get anti-procrastination coaching advice."""
    db = get_database()

    # Get user stats
    stats = await get_user_completion_stats(db, current_user["id"])

    # Get pending tasks
    cursor = db.tasks.find({
        "user_id": current_user["id"],
        "status": {"$ne": "completed"},
    })
    tasks = await cursor.to_list(length=100)
    task_dicts = [{
        "title": t["title"],
        "status": t.get("status"),
        "priority_score": t.get("priority_score"),
        "postponement_count": t.get("postponement_count", 0),
        "deadline": t.get("deadline"),
    } for t in tasks]

    # Detect patterns
    patterns = detect_procrastination_patterns(task_dicts, stats)

    # Generate coaching
    coaching = await generate_coaching_nudge(
        patterns=patterns,
        current_tasks=task_dicts,
        user_name=current_user["name"],
    )

    return {
        "patterns": patterns,
        "coaching": coaching,
    }


@router.post("/voice-query")
async def voice_query(
    request: VoiceQueryRequest,
    current_user: dict = Depends(get_current_user),
):
    """Process a voice command / natural language query."""
    db = get_database()
    from google import genai as genai_client
    from app.config import get_settings

    settings = get_settings()
    client = genai_client.Client(api_key=settings.GEMINI_API_KEY)

    # Get context
    stats = await get_user_completion_stats(db, current_user["id"])
    cursor = db.tasks.find({"user_id": current_user["id"], "status": {"$ne": "completed"}})
    tasks = await cursor.to_list(length=20)
    task_summaries = [{"title": t["title"], "deadline": str(t.get("deadline")), "priority": t.get("priority_score")} for t in tasks]

    prompt = f"""You are a helpful productivity assistant for "{current_user['name']}".

USER'S QUESTION: "{request.text}"

CONTEXT:
- Pending tasks: {json.dumps(task_summaries, default=str)}
- Completion rate: {stats['completion_rate']*100:.0f}%
- Total tasks: {stats['total_tasks']}, Completed: {stats['completed_tasks']}

Answer the user's question naturally and helpfully. Be concise (2-4 sentences).
If they ask what to do, recommend their highest priority task.
If they ask about deadlines, mention the closest ones.
Respond in a friendly, coaching tone.
"""

    try:
        response = client.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt)
        return {"response": response.text.strip(), "query": request.text}
    except Exception as e:
        return {"response": "I'm having trouble processing that right now. Try checking your dashboard for priorities.", "query": request.text, "error": str(e)}


@router.post("/crew-analysis")
async def crew_analysis(current_user: dict = Depends(get_current_user)):
    """Run full multi-agent crew analysis."""
    db = get_database()

    stats = await get_user_completion_stats(db, current_user["id"])

    cursor = db.tasks.find({"user_id": current_user["id"], "status": {"$ne": "completed"}})
    tasks = await cursor.to_list(length=50)

    task_dicts = [{
        "title": t["title"],
        "deadline": t.get("deadline"),
        "importance": t.get("importance"),
        "priority_score": t.get("priority_score"),
        "status": t.get("status"),
        "estimated_hours": t.get("estimated_hours"),
        "postponement_count": t.get("postponement_count", 0),
    } for t in tasks]

    result = await run_crew_analysis(
        tasks=task_dicts,
        user_info=current_user,
        stats=stats,
    )

    return result
