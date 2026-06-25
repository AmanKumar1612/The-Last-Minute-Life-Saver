"""
AI Task Breakdown using Google Gemini.

Decomposes large tasks into actionable subtasks with
estimated times and dependencies.
"""

import json
from typing import List, Optional
from google import genai
from app.config import get_settings

settings = get_settings()

_client = None

def _get_client():
    """Get or create Gemini client."""
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


async def breakdown_task(
    title: str,
    description: Optional[str] = None,
    estimated_hours: Optional[float] = None,
    category: str = "other",
) -> List[dict]:
    """
    Use Gemini to break a task into actionable subtasks.

    Returns list of subtasks with:
    - title: str
    - estimated_hours: float
    - dependency: Optional[str]  (title of prerequisite subtask)
    """
    client = _get_client()

    prompt = f"""You are a productivity expert. Break down the following task into 
actionable, specific subtasks. Each subtask should be small enough to complete in one sitting.

Task: {title}
{f"Description: {description}" if description else ""}
{f"Total Estimated Hours: {estimated_hours}" if estimated_hours else ""}
Category: {category}

Return a JSON array of subtasks. Each subtask must have:
- "title": A clear, actionable step (start with a verb)
- "estimated_hours": Realistic time estimate (float, minimum 0.25)
- "dependency": Title of the prerequisite subtask, or null if none
- "completed": false

Rules:
1. Create 4-8 subtasks
2. Be specific and actionable (e.g., "Research 3 ML algorithms for classification" not "Do research")
3. Order them logically
4. Make dependencies explicit
5. Ensure estimated hours sum to roughly the total estimate (if given)
6. Return ONLY the JSON array, no markdown, no explanation

Example output:
[
  {{"title": "Research dataset requirements", "estimated_hours": 1.0, "dependency": null, "completed": false}},
  {{"title": "Download and preprocess dataset", "estimated_hours": 2.0, "dependency": "Research dataset requirements", "completed": false}}
]"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
        )
        text = response.text.strip()

        # Clean up response — remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        subtasks = json.loads(text)

        # Validate structure
        validated = []
        for st in subtasks:
            validated.append({
                "title": str(st.get("title", "Untitled step")),
                "estimated_hours": float(st.get("estimated_hours", 0.5)),
                "dependency": st.get("dependency"),
                "completed": False,
            })

        return validated

    except Exception as e:
        # Fallback: generate basic subtasks without AI
        print(f"Gemini breakdown error: {e}")
        return _fallback_breakdown(title, estimated_hours)


def _fallback_breakdown(title: str, estimated_hours: Optional[float] = None) -> List[dict]:
    """Generate basic subtasks when AI is unavailable."""
    hours = estimated_hours or 4.0
    step_hours = round(hours / 4, 1)

    return [
        {"title": f"Research and plan: {title}", "estimated_hours": step_hours, "dependency": None, "completed": False},
        {"title": f"Set up workspace and gather resources", "estimated_hours": step_hours * 0.5, "dependency": f"Research and plan: {title}", "completed": False},
        {"title": f"Execute core work: {title}", "estimated_hours": step_hours * 1.5, "dependency": "Set up workspace and gather resources", "completed": False},
        {"title": f"Review, refine, and finalize", "estimated_hours": step_hours, "dependency": f"Execute core work: {title}", "completed": False},
    ]


async def store_subtasks(db, task_id: str, user_id: str, subtasks: List[dict]) -> dict:
    """Store generated subtasks in the task document."""
    from bson import ObjectId

    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": user_id},
        {"$set": {"subtasks": subtasks}},
        return_document=True,
    )
    return result
