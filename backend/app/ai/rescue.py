"""
Emergency Rescue Mode.

When a user is about to miss a deadline, generates an
intensive recovery plan with minute-by-minute scheduling.
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


async def generate_rescue_plan(
    deadline: datetime,
    tasks: List[dict],
    available_hours: float,
    start_time: Optional[str] = None,
) -> dict:
    """Generate an emergency recovery plan."""
    now = datetime.now(timezone.utc)
    hours_until_deadline = max(0, (deadline - now).total_seconds() / 3600)

    tasks_text = ""
    total_estimated = 0
    for t in tasks:
        est = t.get("estimated_hours", 1.0)
        total_estimated += est
        tasks_text += f"- {t.get('title', 'Task')}: {est}h estimated\n"

    current_time = start_time or now.strftime("%H:%M")

    client = _get_client()

    prompt = f"""You are an emergency productivity coach. A user needs to complete all tasks before a tight deadline.

DEADLINE: {deadline.strftime("%Y-%m-%d %H:%M")} ({hours_until_deadline:.1f} hours from now)
AVAILABLE WORKING HOURS: {available_hours}h
STARTING NOW: {current_time}
TOTAL ESTIMATED WORK: {total_estimated}h

REMAINING TASKS:
{tasks_text}

Create an emergency recovery plan. Rules:
1. Schedule work in focused 45-90 minute blocks
2. Include SHORT breaks (5-10 min) between blocks
3. Include ONE longer break (15-20 min) every 3 hours
4. If total work exceeds available time, suggest scope reduction
5. Order by deadline urgency and dependencies
6. Be encouraging but realistic

Return a JSON object:
{{
  "is_feasible": true/false,
  "feasibility_note": "Explanation of whether this is achievable",
  "scope_reductions": ["List of suggested cuts if needed"],
  "timeline": [
    {{
      "start_time": "19:00",
      "end_time": "20:30",
      "task": "Task name",
      "type": "work",
      "focus_tip": "Focus on the core algorithm, skip optimizations for now"
    }},
    {{
      "start_time": "20:30",
      "end_time": "20:40",
      "task": "Break",
      "type": "break",
      "focus_tip": "Stand up, stretch, drink water"
    }}
  ],
  "motivational_message": "An encouraging message",
  "estimated_completion_time": "23:30"
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
        print(f"Gemini rescue error: {e}")
        return _fallback_rescue_plan(tasks, available_hours, current_time, deadline)


def _fallback_rescue_plan(tasks, available_hours, start_time, deadline):
    """Generate basic rescue plan when AI is unavailable."""
    timeline = []
    try:
        hour, minute = map(int, start_time.split(":"))
    except (ValueError, AttributeError):
        hour, minute = 19, 0

    total_estimated = sum(t.get("estimated_hours", 1) for t in tasks)
    is_feasible = total_estimated <= available_hours

    for task in tasks:
        est = task.get("estimated_hours", 1.0)
        block_hours = min(est, 1.5)

        start = f"{hour:02d}:{minute:02d}"
        minute += int(block_hours * 60)
        hour += minute // 60
        minute = minute % 60
        end = f"{hour:02d}:{minute:02d}"

        timeline.append({"start_time": start, "end_time": end, "task": task.get("title", "Task"), "type": "work", "focus_tip": "Focus deeply, minimize distractions"})

        start = end
        minute += 10
        hour += minute // 60
        minute = minute % 60
        end = f"{hour:02d}:{minute:02d}"
        timeline.append({"start_time": start, "end_time": end, "task": "Break", "type": "break", "focus_tip": "Rest and recharge"})

    return {
        "is_feasible": is_feasible,
        "feasibility_note": "Plan generated without AI" if not is_feasible else "Achievable with focused effort",
        "scope_reductions": [] if is_feasible else ["Consider reducing scope on lower-priority tasks"],
        "timeline": timeline,
        "motivational_message": "You've got this! Take it one block at a time. 💪",
        "estimated_completion_time": f"{hour:02d}:{minute:02d}",
    }
