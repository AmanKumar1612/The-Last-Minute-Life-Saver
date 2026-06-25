"""
Analytics aggregation service.
"""

from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase


async def get_analytics(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    """
    Generate comprehensive productivity analytics.
    """
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # ─── Overall Stats ─────────────────────
    total_tasks = await db.tasks.count_documents({"user_id": user_id})
    completed_tasks = await db.tasks.count_documents({"user_id": user_id, "status": "completed"})
    pending_tasks = await db.tasks.count_documents({"user_id": user_id, "status": {"$in": ["pending", "in_progress"]}})
    overdue_tasks = await db.tasks.count_documents({
        "user_id": user_id,
        "status": {"$ne": "completed"},
        "deadline": {"$lt": now},
    })

    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # ─── Weekly Productivity (tasks completed per day) ─────────
    weekly_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "status": "completed",
                "completed_at": {"$gte": week_ago},
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$completed_at"}
                },
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id": 1}},
    ]
    weekly_raw = await db.tasks.aggregate(weekly_pipeline).to_list(length=7)

    # Fill in missing days
    weekly_productivity = []
    for i in range(7):
        day = (week_ago + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        day_short = (week_ago + timedelta(days=i + 1)).strftime("%a")
        count = next((d["count"] for d in weekly_raw if d["_id"] == day), 0)
        weekly_productivity.append({"date": day, "day": day_short, "tasks_completed": count})

    # ─── Focus Hours ───────────────────────
    focus_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "status": "completed",
                "estimated_hours": {"$exists": True, "$ne": None},
            }
        },
        {
            "$group": {
                "_id": None,
                "total_hours": {"$sum": "$estimated_hours"},
                "this_week": {
                    "$sum": {
                        "$cond": [{"$gte": ["$completed_at", week_ago]}, "$estimated_hours", 0]
                    }
                },
            }
        },
    ]
    focus_result = await db.tasks.aggregate(focus_pipeline).to_list(1)
    total_focus_hours = focus_result[0]["total_hours"] if focus_result else 0
    weekly_focus_hours = focus_result[0]["this_week"] if focus_result else 0

    # ─── Missed Deadlines ──────────────────
    missed_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "event_type": "task_completed",
                "was_overdue": True,
                "timestamp": {"$gte": month_ago},
            }
        },
        {"$count": "missed"},
    ]
    missed_result = await db.analytics_events.aggregate(missed_pipeline).to_list(1)
    missed_deadlines = missed_result[0]["missed"] if missed_result else 0

    # ─── Category Distribution ─────────────
    category_pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
    ]
    categories = await db.tasks.aggregate(category_pipeline).to_list(length=10)
    category_distribution = [{"category": c["_id"] or "other", "count": c["count"]} for c in categories]

    # ─── Goal Progress ─────────────────────
    goals_cursor = db.goals.find({"user_id": user_id})
    goals = await goals_cursor.to_list(length=20)
    goal_progress = []
    for g in goals:
        milestones = g.get("milestones", [])
        completed_m = sum(1 for m in milestones if m.get("completed"))
        progress = (completed_m / len(milestones) * 100) if milestones else 0
        goal_progress.append({
            "id": str(g["_id"]),
            "title": g["title"],
            "progress": round(progress, 1),
            "milestones_total": len(milestones),
            "milestones_completed": completed_m,
        })

    # ─── Streak ────────────────────────────
    streak = 0
    for i in range(30):
        day = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        count = next((d["tasks_completed"] for d in weekly_productivity if d["date"] == day), None)
        if count is None:
            day_count = await db.tasks.count_documents({
                "user_id": user_id,
                "status": "completed",
                "completed_at": {
                    "$gte": datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc),
                    "$lt": datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1),
                },
            })
            count = day_count
        if count > 0:
            streak += 1
        else:
            break

    return {
        "overview": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "overdue_tasks": overdue_tasks,
            "completion_rate": round(completion_rate, 1),
            "streak_days": streak,
        },
        "weekly_productivity": weekly_productivity,
        "focus_hours": {
            "total": round(total_focus_hours, 1),
            "this_week": round(weekly_focus_hours, 1),
        },
        "missed_deadlines": missed_deadlines,
        "category_distribution": category_distribution,
        "goal_progress": goal_progress,
    }
