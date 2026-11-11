import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

class AudioResponse(BaseModel):
    id: uuid.UUID
    story_id: uuid.UUID
    voice_id: str
    voice_name: str
    ambient_sound: str
    voice_volume: float
    ambient_volume: float
    audio_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    subtitles_json: Optional[Any] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AudioMixerSettings(BaseModel):
    voice_volume: Optional[float] = None
    ambient_volume: Optional[float] = None
    ambient_sound: Optional[str] = None

