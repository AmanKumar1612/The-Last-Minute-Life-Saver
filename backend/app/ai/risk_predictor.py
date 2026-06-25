"""
Deadline Risk Prediction Module.

Uses a combination of heuristic scoring and lightweight ML
to predict the probability of missing a deadline.
"""

import math
from datetime import datetime, timezone
from typing import Optional, List
import numpy as np


def predict_risk(
    deadline: Optional[datetime],
    estimated_hours: Optional[float],
    hours_logged: float = 0.0,
    completion_rate: float = 0.5,
    postponement_count: int = 0,
    subtask_completion_ratio: float = 0.0,
) -> dict:
    """
    Predict the risk of missing a deadline.

    Returns:
    {
        "risk_percentage": float (0-100),
        "risk_level": str ("Safe" | "Warning" | "High Risk"),
        "factors": list of contributing factors,
        "recommendation": str
    }
    """
    if not deadline:
        return {
            "risk_percentage": 10.0,
            "risk_level": "Safe",
            "factors": ["No deadline set"],
            "recommendation": "Consider setting a deadline to stay accountable.",
        }

    now = datetime.now(timezone.utc)
    hours_remaining = max(0, (deadline - now).total_seconds() / 3600)
    est_hours = estimated_hours or 2.0
    remaining_work_hours = max(0, est_hours - hours_logged)

    factors = []
    risk_score = 0.0

    # Factor 1: Time pressure (0-35 points)
    if hours_remaining <= 0:
        risk_score += 35
        factors.append("Deadline has passed")
    elif remaining_work_hours > hours_remaining:
        risk_score += 35
        factors.append(f"Need {remaining_work_hours:.1f}h but only {hours_remaining:.1f}h remain")
    elif remaining_work_hours > hours_remaining * 0.7:
        risk_score += 25
        factors.append("Very tight timeline — little margin for error")
    elif remaining_work_hours > hours_remaining * 0.4:
        risk_score += 15
        factors.append("Timeline is manageable but needs focus")
    else:
        risk_score += 5
        factors.append("Sufficient time available")

    # Factor 2: Historical completion rate (0-25 points)
    if completion_rate < 0.3:
        risk_score += 25
        factors.append("Low historical completion rate")
    elif completion_rate < 0.5:
        risk_score += 18
        factors.append("Below-average completion rate")
    elif completion_rate < 0.7:
        risk_score += 10
        factors.append("Average completion rate")
    else:
        risk_score += 3

    # Factor 3: Postponement history (0-20 points)
    if postponement_count >= 3:
        risk_score += 20
        factors.append(f"Postponed {postponement_count} times — pattern of delay")
    elif postponement_count >= 1:
        risk_score += 10
        factors.append(f"Postponed {postponement_count} time(s)")

    # Factor 4: Subtask progress (0-20 points)
    if subtask_completion_ratio < 0.1 and hours_remaining < est_hours * 2:
        risk_score += 20
        factors.append("Very little progress on subtasks with deadline approaching")
    elif subtask_completion_ratio < 0.3:
        risk_score += 12
        factors.append("Limited subtask progress")
    elif subtask_completion_ratio > 0.7:
        risk_score += 2
        factors.append("Good progress on subtasks")

    # Clamp
    risk_percentage = max(0, min(100, risk_score))

    # Determine risk level
    if risk_percentage >= 70:
        risk_level = "High Risk"
    elif risk_percentage >= 40:
        risk_level = "Warning"
    else:
        risk_level = "Safe"

    # Generate recommendation
    recommendation = _generate_recommendation(
        risk_level, hours_remaining, remaining_work_hours, postponement_count
    )

    return {
        "risk_percentage": round(risk_percentage, 1),
        "risk_level": risk_level,
        "factors": factors,
        "recommendation": recommendation,
    }


def _generate_recommendation(
    risk_level: str,
    hours_remaining: float,
    remaining_work_hours: float,
    postponement_count: int,
) -> str:
    """Generate a context-aware recommendation based on risk analysis."""
    if risk_level == "High Risk":
        if hours_remaining <= 0:
            return "⚠️ Deadline has passed. Consider entering Emergency Rescue Mode to create a recovery plan."
        if remaining_work_hours > hours_remaining:
            return (
                f"🚨 You need about {remaining_work_hours:.1f} hours but only {hours_remaining:.1f} hours remain. "
                f"Activate Emergency Rescue Mode or reduce scope immediately."
            )
        return "⏰ High risk of missing this deadline. Start working immediately and consider breaking the task into smaller pieces."

    if risk_level == "Warning":
        if postponement_count >= 2:
            return "📋 You've postponed this task multiple times. Try working on it for just 15 minutes to build momentum."
        return f"⚡ You have about {hours_remaining:.0f} hours remaining. Schedule a focused work block today to stay on track."

    return "✅ You're on track! Keep up the good work and maintain your current pace."


async def analyze_all_tasks_risk(db, user_id: str) -> List[dict]:
    """Analyze risk for all pending tasks."""
    from app.tasks.service import get_user_completion_stats

    stats = await get_user_completion_stats(db, user_id)

    cursor = db.tasks.find({
        "user_id": user_id,
        "status": {"$ne": "completed"},
    })
    tasks = await cursor.to_list(length=200)

    results = []
    for task in tasks:
        subtasks = task.get("subtasks", [])
        completed_subtasks = sum(1 for s in subtasks if s.get("completed"))
        subtask_ratio = completed_subtasks / len(subtasks) if subtasks else 0

        risk = predict_risk(
            deadline=task.get("deadline"),
            estimated_hours=task.get("estimated_hours"),
            completion_rate=stats["completion_rate"],
            postponement_count=task.get("postponement_count", 0),
            subtask_completion_ratio=subtask_ratio,
        )

        # Update task with risk percentage
        from bson import ObjectId
        await db.tasks.update_one(
            {"_id": task["_id"]},
            {"$set": {"risk_percentage": risk["risk_percentage"]}},
        )

        results.append({
            "task_id": str(task["_id"]),
            "title": task["title"],
            "deadline": task.get("deadline"),
            **risk,
        })

    # Sort by risk descending
    results.sort(key=lambda x: x["risk_percentage"], reverse=True)
    return results
