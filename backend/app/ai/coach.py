"""
Anti-Procrastination Coach.

Detects procrastination patterns and generates:
- Motivational nudges
- Micro-task recommendations
- Focus session suggestions
"""

import json
from typing import List
from google import genai
from app.config import get_settings

settings = get_settings()

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def detect_procrastination_patterns(tasks: List[dict], stats: dict) -> dict:
    """Analyze user behavior for procrastination signals."""
    patterns = []
    severity = 0

    high_postponement = [t for t in tasks if t.get("postponement_count", 0) >= 2]
    if high_postponement:
        severity += 25
        patterns.append({"type": "repeated_postponement", "description": f"{len(high_postponement)} task(s) postponed 2+ times", "tasks": [t["title"] for t in high_postponement[:3]]})

    pending_count = len([t for t in tasks if t.get("status") == "pending"])
    if pending_count > 10:
        severity += 20
        patterns.append({"type": "task_overload", "description": f"{pending_count} pending tasks — possible overwhelm", "tasks": []})

    completion_rate = stats.get("completion_rate", 0.5)
    if completion_rate < 0.3:
        severity += 30
        patterns.append({"type": "low_completion", "description": f"Only {completion_rate*100:.0f}% task completion rate", "tasks": []})

    overdue = [t for t in tasks if t.get("status") == "overdue"]
    if overdue:
        severity += 25
        patterns.append({"type": "missed_deadlines", "description": f"{len(overdue)} overdue task(s)", "tasks": [t["title"] for t in overdue[:3]]})

    severity = min(100, severity)
    return {"patterns": patterns, "severity": severity, "is_procrastinating": severity >= 30}


async def generate_coaching_nudge(patterns: dict, current_tasks: List[dict], user_name: str = "there") -> dict:
    """Generate personalized coaching based on detected patterns."""
    client = _get_client()

    severity = patterns.get("severity", 0)
    pattern_descriptions = [p["description"] for p in patterns.get("patterns", [])]

    urgent_tasks = sorted(current_tasks, key=lambda x: x.get("priority_score", 0), reverse=True)[:3]
    urgent_text = "\n".join(f"- {t['title']} (Priority: {t.get('priority_score', 'N/A')})" for t in urgent_tasks)

    prompt = f"""You are a warm, supportive but firm productivity coach. The user "{user_name}" is showing signs of procrastination.

PROCRASTINATION SEVERITY: {severity}/100
DETECTED PATTERNS:
{chr(10).join(f"- {p}" for p in pattern_descriptions) if pattern_descriptions else "- General low productivity"}

MOST URGENT TASKS:
{urgent_text if urgent_text else "- No urgent tasks identified"}

Generate coaching advice as a JSON object:
{{
  "nudge": "A personalized, empathetic but motivating message (2-3 sentences). Reference specific tasks. Don't be generic.",
  "micro_tasks": [
    "A tiny 5-minute action step",
    "Another small step (10-15 min)",
    "A slightly bigger step (20-30 min)"
  ],
  "focus_suggestion": {{
    "technique": "Pomodoro / Deep Work / 2-Minute Rule / etc.",
    "duration_minutes": 25,
    "description": "Brief description of the technique and how to apply it now"
  }},
  "motivation_type": "{'urgent' if severity >= 70 else 'firm' if severity >= 40 else 'gentle'}"
}}

Rules:
1. Be empathetic, not judgmental
2. Make micro_tasks VERY specific and actionable
3. Reference the user's actual tasks when possible
4. If severity is high, be more direct and urgent
5. Return ONLY the JSON, no markdown
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

        return json.loads(text)

    except Exception as e:
        print(f"Gemini coach error: {e}")
        return _fallback_nudge(severity, urgent_tasks)


def _fallback_nudge(severity, tasks):
    """Generate basic coaching when AI is unavailable."""
    if severity >= 70:
        nudge = "🚨 Several tasks need your attention right now. Let's focus on just ONE thing for the next 15 minutes."
        motivation_type = "urgent"
    elif severity >= 40:
        nudge = "📋 You've got a few things piling up. Let's tackle the most important one first."
        motivation_type = "firm"
    else:
        nudge = "👋 Hey! Let's keep the momentum going. Pick one task and give it 25 focused minutes."
        motivation_type = "gentle"

    task_name = tasks[0]["title"] if tasks else "your most important task"

    return {
        "nudge": nudge,
        "micro_tasks": [f"Open and review '{task_name}' for 2 minutes", f"Work on the first subtask for 10 minutes", f"Complete one meaningful chunk (25 minutes)"],
        "focus_suggestion": {"technique": "Pomodoro Technique", "duration_minutes": 25, "description": "Set a timer for 25 minutes of uninterrupted work, followed by a 5-minute break."},
        "motivation_type": motivation_type,
    }
