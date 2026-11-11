import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.audio import AudioResponse

class StoryBase(BaseModel):
    title: str
    narrative_text: str
    category: str = "abundance"
    is_favorite: bool = False
    is_daily: bool = True

class StoryCreate(StoryBase):
    prompt_used: Optional[str] = None

class StoryGenerateRequest(BaseModel):
    prompt: Optional[str] = None
    category: Optional[str] = "abundance"
    voice_tone: Optional[str] = "calm"
    ambient_sound: Optional[str] = "binaural_432hz"

class StoryResponse(StoryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    prompt_used: Optional[str] = None
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    audio: Optional[AudioResponse] = None

    model_config = ConfigDict(from_attributes=True)

