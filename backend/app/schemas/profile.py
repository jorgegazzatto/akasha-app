import uuid
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict

class ProfileBase(BaseModel):
    # 1. Identidade
    preferred_name: Optional[str] = None
    gender: Optional[str] = None
    orientation: Optional[str] = None
    age: Optional[int] = None
    has_children: bool = False
    children_details: Optional[str] = None

    # 2. Carreira
    occupation: Optional[str] = None
    career_feelings: Optional[str] = None
    career_goals: Optional[str] = None

    # 3. Conflito & Resiliência
    self_description: Optional[str] = None
    defining_moments: Optional[str] = None
    current_challenges: Optional[str] = None

    # 4. Coadjuvantes Afetivos
    relationship_status: Optional[str] = None
    loved_one_name: Optional[str] = None
    loved_one_qualities: Optional[str] = None
    desired_connections: Optional[str] = None

    # 5. O Sonho Manifestado
    dream_cities: Optional[List[str]] = []
    dream_home_style: Optional[str] = None
    deep_aspirations: Optional[str] = None
    preferred_voice_tone: Optional[str] = "calm"

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

