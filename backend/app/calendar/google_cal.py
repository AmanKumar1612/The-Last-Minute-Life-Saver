"""
Google Calendar integration.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, List
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from app.config import get_settings

settings = get_settings()

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def get_auth_flow() -> Flow:
    """Create Google OAuth flow."""
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
    )
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    return flow


def get_auth_url() -> str:
    """Get Google OAuth authorization URL."""
    flow = get_auth_flow()
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return auth_url


async def exchange_code(code: str) -> dict:
    """Exchange authorization code for tokens."""
    flow = get_auth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": list(credentials.scopes),
    }


async def get_events(
    token_data: dict,
    date: Optional[str] = None,
    max_results: int = 20,
) -> List[dict]:
    """Get calendar events for a specific day."""
    credentials = Credentials(
        token=token_data.get("token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri=token_data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=token_data.get("client_id", settings.GOOGLE_CLIENT_ID),
        client_secret=token_data.get("client_secret", settings.GOOGLE_CLIENT_SECRET),
    )

    service = build("calendar", "v3", credentials=credentials)

    if date:
        day_start = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    else:
        day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    day_end = day_start + timedelta(days=1)

    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMin=day_start.isoformat(),
            timeMax=day_end.isoformat(),
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )

    events = events_result.get("items", [])

    return [
        {
            "id": evt.get("id"),
            "summary": evt.get("summary", "No title"),
            "start": evt.get("start", {}).get("dateTime", evt.get("start", {}).get("date")),
            "end": evt.get("end", {}).get("dateTime", evt.get("end", {}).get("date")),
            "description": evt.get("description"),
        }
        for evt in events
    ]


async def get_free_slots(
    token_data: dict,
    date: Optional[str] = None,
    start_hour: int = 9,
    end_hour: int = 22,
) -> List[dict]:
    """Detect free time slots in the calendar."""
    events = await get_events(token_data, date)

    if date:
        base_date = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    else:
        base_date = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    day_start = base_date.replace(hour=start_hour)
    day_end = base_date.replace(hour=end_hour)

    # Parse event times
    busy_slots = []
    for evt in events:
        try:
            start = datetime.fromisoformat(evt["start"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(evt["end"].replace("Z", "+00:00"))
            busy_slots.append((start, end))
        except (ValueError, KeyError, TypeError):
            continue

    busy_slots.sort(key=lambda x: x[0])

    # Find free slots
    free_slots = []
    current = day_start

    for busy_start, busy_end in busy_slots:
        if current < busy_start:
            duration = (busy_start - current).total_seconds() / 3600
            if duration >= 0.5:  # At least 30 min
                free_slots.append({
                    "start": current.strftime("%H:%M"),
                    "end": busy_start.strftime("%H:%M"),
                    "duration_hours": round(duration, 1),
                })
        current = max(current, busy_end)

    if current < day_end:
        duration = (day_end - current).total_seconds() / 3600
        if duration >= 0.5:
            free_slots.append({
                "start": current.strftime("%H:%M"),
                "end": day_end.strftime("%H:%M"),
                "duration_hours": round(duration, 1),
            })

    return free_slots
