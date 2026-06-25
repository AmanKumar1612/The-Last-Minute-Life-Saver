"""
Analytics API endpoint.
"""

from fastapi import APIRouter, Depends
from app.database import get_database
from app.auth.dependencies import get_current_user
from app.analytics.service import get_analytics

router = APIRouter()


@router.get("")
async def analytics(current_user: dict = Depends(get_current_user)):
    """Get comprehensive productivity analytics."""
    db = get_database()
    data = await get_analytics(db, current_user["id"])
    return data
