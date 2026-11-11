from fastapi import APIRouter
from app.api.v1 import health, users, profile, stories, audio

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(profile.router, prefix="/users", tags=["Profile & Onboarding"])
api_router.include_router(stories.router, prefix="/stories", tags=["Stories & Manifestations"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio & Streaming"])
