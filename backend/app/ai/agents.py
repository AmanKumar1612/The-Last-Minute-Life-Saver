"""
CrewAI Multi-Agent System using Google Gemini.

Agents:
1. Planner Agent — Creates schedules
2. Prioritization Agent — Ranks tasks
3. Productivity Coach Agent — Gives recommendations
4. Reminder Agent — Creates personalized reminders
5. Rescue Agent — Creates emergency plans
"""

import json
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


AGENTS = {
    "planner": {
        "role": "Schedule Planner",
        "goal": "Create optimal daily and weekly schedules that maximize productivity while preventing burnout",
        "backstory": "You are an expert time management consultant who has helped thousands of professionals optimize their schedules.",
    },
    "prioritizer": {
        "role": "Task Prioritization Expert",
        "goal": "Rank and organize tasks by urgency, importance, and strategic value",
        "backstory": "You are a strategic advisor who specializes in the Eisenhower Matrix, Getting Things Done, and other prioritization frameworks.",
    },
    "coach": {
        "role": "Productivity Coach",
        "goal": "Motivate users, identify procrastination patterns, and provide actionable productivity advice",
        "backstory": "You are a behavioral psychologist and certified productivity coach.",
    },
    "reminder": {
        "role": "Context-Aware Reminder Specialist",
        "goal": "Create personalized, motivating reminders that help users stay on track",
        "backstory": "You craft messages that are perfectly timed and worded to motivate action.",
    },
    "rescue": {
        "role": "Emergency Recovery Specialist",
        "goal": "Create intensive but sustainable recovery plans when deadlines are at risk",
        "backstory": "You are a crisis management expert who specializes in helping people complete work under extreme time pressure.",
    },
}


async def run_agent(agent_name: str, context: dict, specific_instruction: str = "") -> dict:
    """Run a specific agent with the given context."""
    agent = AGENTS.get(agent_name)
    if not agent:
        return {"error": f"Unknown agent: {agent_name}"}

    client = _get_client()

    prompt = f"""You are the {agent['role']}.

YOUR GOAL: {agent['goal']}
BACKSTORY: {agent['backstory']}

CONTEXT:
{json.dumps(context, indent=2, default=str)}

{f"SPECIFIC INSTRUCTION: {specific_instruction}" if specific_instruction else ""}

Provide your expert analysis as a JSON object with these keys:
- "analysis": Your assessment (1-2 paragraphs)
- "recommendations": List of 3-5 specific, actionable recommendations
- "priority_actions": The top 1-2 things the user should do RIGHT NOW
- "insights": Any patterns or insights you've noticed

Return ONLY the JSON, no markdown.
"""

    try:
        response = client.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
        result = json.loads(text)
        result["agent"] = agent_name
        result["role"] = agent["role"]
        return result
    except Exception as e:
        print(f"Agent {agent_name} error: {e}")
        return {"agent": agent_name, "role": agent["role"], "analysis": "Unable to generate analysis.", "recommendations": ["Focus on your highest priority task"], "priority_actions": ["Start with the most urgent task"], "insights": [], "error": str(e)}


async def run_crew_analysis(tasks: List[dict], user_info: dict, stats: dict) -> dict:
    """Run all agents and combine their insights."""
    context = {
        "tasks": [{"title": t.get("title"), "deadline": t.get("deadline"), "importance": t.get("importance"), "priority_score": t.get("priority_score"), "status": t.get("status"), "estimated_hours": t.get("estimated_hours"), "postponement_count": t.get("postponement_count", 0)} for t in tasks[:10]],
        "user": {"name": user_info.get("name"), "profession": user_info.get("profession"), "goals": user_info.get("productivity_goals", [])},
        "stats": stats,
    }

    client = _get_client()

    prompt = f"""You are a team of 5 productivity experts conducting a comprehensive analysis. 
You are simultaneously acting as: Schedule Planner, Task Prioritizer, Productivity Coach, Reminder Specialist, Emergency Advisor.

CONTEXT:
{json.dumps(context, indent=2, default=str)}

Provide a comprehensive, unified analysis as a JSON object:
{{
  "overall_assessment": "2-3 sentence overview",
  "priority_ranking": [{{"task": "task title", "rank": 1, "reason": "why"}}],
  "schedule_suggestions": ["Specific scheduling recommendation"],
  "coaching_insights": {{
    "strengths": ["What the user is doing well"],
    "areas_for_improvement": ["What needs attention"],
    "motivation_message": "Personalized encouragement"
  }},
  "reminders": [{{"task": "task title", "message": "Personalized reminder text", "urgency": "high/medium/low"}}],
  "risk_alerts": [{{"task": "task title", "risk": "What might go wrong", "mitigation": "What to do"}}],
  "daily_tip": "One actionable productivity tip for today"
}}

Return ONLY the JSON, no markdown.
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
        print(f"Crew analysis error: {e}")
        return {
            "overall_assessment": "Unable to generate full analysis. Focus on your highest priority tasks.",
            "priority_ranking": [], "schedule_suggestions": ["Start with your most urgent task"],
            "coaching_insights": {"strengths": [], "areas_for_improvement": [], "motivation_message": "Keep going!"},
            "reminders": [], "risk_alerts": [],
            "daily_tip": "Try the Pomodoro technique: 25 minutes of focused work, then a 5-minute break.",
        }
