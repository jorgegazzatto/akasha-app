import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.story import Story
from app.models.user import User
from app.schemas.story import StoryResponse, StoryCreate

router = APIRouter()

@router.get("/user/{user_id}", response_model=List[StoryResponse])
async def list_user_stories(
    user_id: uuid.UUID,
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    favorites_only: bool = Query(False, description="Apenas favoritas"),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista a biblioteca de histórias geradas para o usuário.
    """
    stmt = (
        select(Story)
        .where(Story.user_id == user_id)
        .options(selectinload(Story.audio))
        .order_by(desc(Story.created_at))
    )

    if category:
        stmt = stmt.where(Story.category == category)
    if favorites_only:
        stmt = stmt.where(Story.is_favorite == True)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/user/{user_id}/daily", response_model=List[StoryResponse])
async def get_daily_stories(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna as histórias do ciclo diário de 24h (para a Home / Carrossel For You).
    """
    now = datetime.utcnow()
    stmt = (
        select(Story)
        .where(Story.user_id == user_id)
        .where(Story.is_daily == True)
        .where((Story.expires_at == None) | (Story.expires_at > now))
        .options(selectinload(Story.audio))
        .order_by(desc(Story.created_at))
        .limit(10)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{story_id}", response_model=StoryResponse)
async def get_story_by_id(
    story_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Busca uma história específica com os dados de áudio e legendas sincronizadas.
    """
    stmt = (
        select(Story)
        .where(Story.id == story_id)
        .options(selectinload(Story.audio))
    )
    result = await db.execute(stmt)
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="História não encontrada."
        )
    return story

@router.patch("/{story_id}/favorite", response_model=StoryResponse)
async def toggle_favorite(
    story_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Alterna o status de favorita de uma história.
    """
    stmt = (
        select(Story)
        .where(Story.id == story_id)
        .options(selectinload(Story.audio))
    )
    result = await db.execute(stmt)
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="História não encontrada."
        )

    story.is_favorite = not story.is_favorite
    await db.commit()
    await db.refresh(story)
    return story

