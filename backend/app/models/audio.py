import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class AudioSession(Base):
    __tablename__ = "audio_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    story_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    voice_id: Mapped[str] = mapped_column(String(100), nullable=False)
    voice_name: Mapped[str] = mapped_column(String(100), default="Aura")
    ambient_sound: Mapped[str] = mapped_column(String(50), default="binaural_432hz")
    voice_volume: Mapped[float] = mapped_column(Float, default=0.85)
    ambient_volume: Mapped[float] = mapped_column(Float, default=0.35)

    audio_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    subtitles_json: Mapped[Optional[dict]] = mapped_column(JSON, default=list, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="processing") # processing, ready, failed

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    # Relationships
    story: Mapped["Story"] = relationship("Story", back_populates="audio")

