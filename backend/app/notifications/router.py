"""
Notifications API endpoints.
"""

from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Depends
from app.database import get_database
from app.auth.dependencies import get_current_user
from app.notifications.firebase import send_notification

router = APIRouter()


class RegisterTokenRequest(BaseModel):
    fcm_token: str


class SendNotificationRequest(BaseModel):
    title: str
    body: str
    data: Optional[dict] = None


@router.post("/register-token")
async def register_fcm_token(
    request: RegisterTokenRequest,
    current_user: dict = Depends(get_current_user),
):
    """Register a device FCM token."""
    db = get_database()
    from bson import ObjectId
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"fcm_token": request.fcm_token}},
    )
    return {"message": "FCM token registered"}


@router.post("/send")
async def send_push_notification(
    request: SendNotificationRequest,
    current_user: dict = Depends(get_current_user),
):
    """Send a push notification to the current user."""
    db = get_database()
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})

    fcm_token = user.get("fcm_token") if user else None
    if not fcm_token:
        return {"success": False, "message": "No FCM token registered"}

    success = await send_notification(fcm_token, request.title, request.body, request.data)
    return {"success": success}
