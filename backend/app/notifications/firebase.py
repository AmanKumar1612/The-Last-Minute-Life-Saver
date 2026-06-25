"""
Firebase Cloud Messaging for push notifications.
"""

import json
from typing import Optional
from app.config import get_settings

settings = get_settings()

_firebase_initialized = False


def _init_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        import firebase_admin
        from firebase_admin import credentials

        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
    except Exception as e:
        print(f"Firebase initialization skipped: {e}")


async def send_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """Send a push notification via FCM."""
    _init_firebase()

    try:
        from firebase_admin import messaging

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data or {},
            token=token,
        )

        response = messaging.send(message)
        print(f"Notification sent: {response}")
        return True
    except Exception as e:
        print(f"Notification error: {e}")
        return False


async def send_context_aware_reminder(
    token: str,
    task_title: str,
    hours_remaining: float,
    estimated_hours: float,
    risk_level: str,
) -> bool:
    """Send a personalized, context-aware reminder."""
    from google import genai as genai_client

    client = genai_client.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""Generate a short, motivating push notification message (max 2 sentences) for this task:

Task: {task_title}
Hours remaining until deadline: {hours_remaining:.1f}
Estimated hours needed: {estimated_hours:.1f}
Risk level: {risk_level}

Make it personal, specific, and action-oriented. Don't be generic.
Return ONLY the notification text, nothing else.
"""

    try:
        response = client.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt)
        body = response.text.strip()
    except Exception:
        if risk_level == "High Risk":
            body = f"⚠️ '{task_title}' needs {estimated_hours:.0f}h but only {hours_remaining:.0f}h remain. Start now!"
        else:
            body = f"📋 Don't forget: '{task_title}' is coming up. You've got this!"

    return await send_notification(
        token=token,
        title="⏰ The Last-Minute Life Saver",
        body=body,
        data={"task_title": task_title, "risk_level": risk_level},
    )
