import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # 1. Dimensão Identidade
    preferred_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    orientation: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    has_children: Mapped[bool] = mapped_column(Boolean, default=False)
    children_details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # 2. Dimensão Carreira
    occupation: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    career_feelings: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    career_goals: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 3. Dimensão Conflito & Resiliência
    self_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    defining_moments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    current_challenges: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 4. Dimensão Coadjuvantes Afetivos
    relationship_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    loved_one_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    loved_one_qualities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    desired_connections: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # 5. Dimensão O Sonho Manifestado
    dream_cities: Mapped[Optional[dict]] = mapped_column(JSON, default=list, nullable=True)
    dream_home_style: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    deep_aspirations: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_voice_tone: Mapped[Optional[str]] = mapped_column(String(50), default="calm", nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profile")

