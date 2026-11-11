import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Story(Base):
    __tablename__ = "stories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    prompt_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    narrative_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="abundance")
    status: Mapped[str] = mapped_column(String(30), default="generated") # pending, generated, voicing, completed, failed
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_daily: Mapped[bool] = mapped_column(Boolean, default=True)
    
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow() + timedelta(hours=24),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="stories")
    audio: Mapped[Optional["AudioSession"]] = relationship(
        "AudioSession", back_populates="story", uselist=False, cascade="all, delete-orphan"
    )

