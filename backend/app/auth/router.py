"""
Authentication API endpoints.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.database import get_database
from app.auth.schemas import (
    UserSignup,
    UserLogin,
    UserResponse,
    TokenResponse,
    UpdateProfile,
)
from app.auth.utils import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(user_data: UserSignup):
    """Register a new user."""
    db = get_database()

    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user document
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "hashed_password": hash_password(user_data.password),
        "profession": user_data.profession,
        "productivity_goals": user_data.productivity_goals or [],
        "created_at": datetime.now(timezone.utc),
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT
    token = create_access_token({"sub": user_id})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"],
            profession=user_doc["profession"],
            productivity_goals=user_doc["productivity_goals"],
            created_at=user_doc["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Authenticate user and return JWT."""
    db = get_database()

    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            profession=user.get("profession"),
            productivity_goals=user.get("productivity_goals", []),
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse(**current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UpdateProfile,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile."""
    db = get_database()
    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields},
    )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user["name"],
        email=updated_user["email"],
        profession=updated_user.get("profession"),
        productivity_goals=updated_user.get("productivity_goals", []),
        created_at=updated_user["created_at"],
    )
