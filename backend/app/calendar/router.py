"""
Google Calendar API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from app.database import get_database
from app.auth.dependencies import get_current_user
from app.calendar import google_cal
from app.config import get_settings

settings = get_settings()
router = APIRouter()


@router.get("/auth-url")
async def get_auth_url(current_user: dict = Depends(get_current_user)):
    """Get Google OAuth authorization URL."""
    try:
        url = google_cal.get_auth_url()
        return {"auth_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate auth URL: {str(e)}")


@router.get("/callback")
async def calendar_callback(code: str = Query(...)):
    """Handle Google OAuth callback."""
    try:
        token_data = await google_cal.exchange_code(code)
        # In production, associate with user session
        return {"message": "Calendar connected successfully", "token_data": token_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth error: {str(e)}")


@router.post("/connect")
async def connect_calendar(
    token_data: dict,
    current_user: dict = Depends(get_current_user),
):
    """Store Google Calendar credentials for the user."""
    db = get_database()
    from bson import ObjectId
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"google_calendar_token": token_data}},
    )
    return {"message": "Calendar connected successfully"}


@router.get("/events")
async def get_events(
    date: str = Query(None, description="YYYY-MM-DD format"),
    current_user: dict = Depends(get_current_user),
):
    """Get calendar events for a specific day."""
    db = get_database()
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})

    token_data = user.get("google_calendar_token") if user else None
    if not token_data:
        return {"events": [], "connected": False}

    try:
        events = await google_cal.get_events(token_data, date)
        return {"events": events, "connected": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch events: {str(e)}")


@router.get("/free-slots")
async def get_free_slots(
    date: str = Query(None),
    start_hour: int = Query(9),
    end_hour: int = Query(22),
    current_user: dict = Depends(get_current_user),
):
    """Detect free time slots in the calendar."""
    db = get_database()
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})

    token_data = user.get("google_calendar_token") if user else None
    if not token_data:
        return {"free_slots": [], "connected": False}

    try:
        slots = await google_cal.get_free_slots(token_data, date, start_hour, end_hour)
        return {"free_slots": slots, "connected": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect free slots: {str(e)}")
