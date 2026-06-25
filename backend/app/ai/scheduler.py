"""
AI Smart Scheduler.

Generates optimized daily plans by:
- Reading Google Calendar events (when connected)
- Detecting free time slots
- Scheduling tasks by priority
- Inserting breaks
"""

import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from google import genai
from app.config import get_settings

settings = get_settings()

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def generate_daily_plan(
    tasks: List[dict],
    calendar_events: Optional[List[dict]] = None,
    available_hours: float = 8.0,
    start_hour: int = 9,
    end_hour: int = 22,
    date: Optional[str] = None,
) -> dict:
    """
    Generate an optimized daily plan.
    """
    target_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    events_text = "No existing calendar events."
    if calendar_events:
        events_text = "Existing calendar events (DO NOT schedule over these):\n"
        for evt in calendar_events:
            events_text += f"- {evt.get('summary', 'Event')}: {evt.get('start', '?')} - {evt.get('end', '?')}\n"

    tasks_text = ""
    sorted_tasks = sorted(tasks, key=lambda x: x.get("priority_score", 0), reverse=True)
    for t in sorted_tasks[:10]:
        tasks_text += (
            f"- {t['title']} | Priority: {t.get('priority_score', 'N/A')} | "
            f"Est: {t.get('estimated_hours', '?')}h | "
            f"Deadline: {t.get('deadline', 'None')}\n"
        )

    client = _get_client()

    prompt = f"""You are a productivity scheduling expert. Create an optimized daily plan for {target_date}.

Available time: {start_hour}:00 to {end_hour}:00 ({available_hours} productive hours)

{events_text}

Tasks to schedule (ordered by priority):
{tasks_text}

Rules:
1. Schedule highest priority tasks during peak focus hours (morning)
2. Include 5-10 min breaks between blocks
3. Include a 30-60 min lunch break around noon
4. Don't schedule more than 2 hours continuous work
5. Leave 15% buffer time for unexpected tasks
6. Don't overlap with existing calendar events

Return a JSON object with this structure:
{{
  "date": "{target_date}",
  "blocks": [
    {{
      "start_time": "09:00",
      "end_time": "11:00",
      "task_title": "Task name",
      "type": "work",
      "notes": "Focus on completing section 2"
    }},
    {{
      "start_time": "11:00",
      "end_time": "11:10",
      "task_title": "Break",
      "type": "break",
      "notes": "Stretch and hydrate"
    }}
  ],
  "summary": "Brief plan summary",
  "total_productive_hours": 6.5
}}

Return ONLY the JSON, no markdown.
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()

        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        plan = json.loads(text)
        return plan

    except Exception as e:
        print(f"Gemini scheduler error: {e}")
        return _fallback_schedule(sorted_tasks, start_hour, end_hour, target_date)


def _fallback_schedule(tasks: List[dict], start_hour: int, end_hour: int, date: str) -> dict:
    """Generate basic schedule when AI is unavailable."""
    blocks = []
    current_hour = start_hour

    for i, task in enumerate(tasks[:5]):
        est = min(task.get("estimated_hours", 1.5), 2.0)
        end = current_hour + est

        if end > end_hour:
            break

        blocks.append({
            "start_time": f"{int(current_hour):02d}:{int((current_hour % 1) * 60):02d}",
            "end_time": f"{int(end):02d}:{int((end % 1) * 60):02d}",
            "task_title": task["title"],
            "type": "work",
            "notes": f"Priority: {task.get('priority_label', 'N/A')}",
        })

        current_hour = end + 0.17
        blocks.append({
            "start_time": f"{int(end):02d}:{int((end % 1) * 60):02d}",
            "end_time": f"{int(current_hour):02d}:{int((current_hour % 1) * 60):02d}",
            "task_title": "Break",
            "type": "break",
            "notes": "Short break",
        })

        if current_hour >= 12 and current_hour < 13:
            blocks.append({
                "start_time": "12:00",
                "end_time": "13:00",
                "task_title": "Lunch Break",
                "type": "break",
                "notes": "Recharge",
            })
            current_hour = 13

    return {
        "date": date,
        "blocks": blocks,
        "summary": f"Scheduled {min(len(tasks), 5)} tasks for the day",
        "total_productive_hours": sum(t.get("estimated_hours", 1) for t in tasks[:5]),
    }
