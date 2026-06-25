"""
AI Task Prioritization Engine.

Calculates priority scores (0-100) based on:
- Deadline urgency
- User-set importance
- Estimated hours vs. available time
- Historical completion rate
"""

from datetime import datetime, timezone
from typing import List, Optional


# Importance weight mapping
IMPORTANCE_WEIGHTS = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}

PRIORITY_LABELS = {
    (80, 101): "Critical",
    (60, 80): "High",
    (35, 60): "Medium",
    (0, 35): "Low",
}


def calculate_priority_score(
    deadline: Optional[datetime],
    importance: str,
    estimated_hours: Optional[float],
    completion_rate: float = 0.5,
    postponement_count: int = 0,
) -> tuple[float, str]:
    """
    Calculate a priority score from 0-100 and return (score, label).

    Algorithm:
    - Urgency score (0-40): Based on time remaining vs. estimated hours
    - Importance score (0-30): Based on user-set importance level
    - Risk score (0-20): Based on historical completion rate
    - Postponement penalty (0-10): More postponements = higher priority
    """
    score = 0.0

    # 1. Urgency Score (0-40 points)
    if deadline:
        now = datetime.now(timezone.utc)
        hours_remaining = max(0, (deadline - now).total_seconds() / 3600)
        est = estimated_hours or 1.0

        if hours_remaining <= 0:
            # Overdue
            urgency = 40.0
        elif hours_remaining <= est:
            # Not enough time left
            urgency = 38.0
        elif hours_remaining <= est * 2:
            # Tight
            urgency = 30.0
        elif hours_remaining <= est * 4:
            # Getting close
            urgency = 20.0
        elif hours_remaining <= 48:
            # Within 2 days
            urgency = 15.0
        elif hours_remaining <= 168:
            # Within a week
            urgency = 8.0
        else:
            urgency = 3.0

        score += urgency
    else:
        # No deadline — moderate base urgency
        score += 10.0

    # 2. Importance Score (0-30 points)
    importance_weight = IMPORTANCE_WEIGHTS.get(importance, 2)
    score += importance_weight * 7.5  # 7.5, 15, 22.5, 30

    # 3. Risk Score (0-20 points) — lower completion rate = higher priority
    risk = (1 - completion_rate) * 20
    score += risk

    # 4. Postponement Penalty (0-10 points)
    postponement_penalty = min(postponement_count * 2.5, 10.0)
    score += postponement_penalty

    # Clamp to 0-100
    score = max(0, min(100, score))

    # Determine label
    label = "Medium"
    for (low, high), lbl in PRIORITY_LABELS.items():
        if low <= score < high:
            label = lbl
            break

    return round(score, 1), label


async def prioritize_all_tasks(db, user_id: str) -> List[dict]:
    """
    Recalculate priority scores for all pending tasks of a user.
    Updates MongoDB and returns sorted tasks.
    """
    from app.tasks.service import get_user_completion_stats

    stats = await get_user_completion_stats(db, user_id)
    completion_rate = stats["completion_rate"]

    # Get all non-completed tasks
    cursor = db.tasks.find({
        "user_id": user_id,
        "status": {"$ne": "completed"},
    })
    tasks = await cursor.to_list(length=200)

    results = []
    for task in tasks:
        score, label = calculate_priority_score(
            deadline=task.get("deadline"),
            importance=task.get("importance", "medium"),
            estimated_hours=task.get("estimated_hours"),
            completion_rate=completion_rate,
            postponement_count=task.get("postponement_count", 0),
        )

        # Update task in DB
        await db.tasks.update_one(
            {"_id": task["_id"]},
            {"$set": {"priority_score": score, "priority_label": label}},
        )

        task["priority_score"] = score
        task["priority_label"] = label
        results.append({
            "id": str(task["_id"]),
            "title": task["title"],
            "priority_score": score,
            "priority_label": label,
            "deadline": task.get("deadline"),
            "importance": task.get("importance"),
            "estimated_hours": task.get("estimated_hours"),
        })

    # Sort by priority score descending
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results
