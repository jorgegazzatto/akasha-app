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
from app.models.profile import UserProfile
from app.models.audio import AudioSession
from app.schemas.story import StoryResponse, StoryGenerateRequest
from app.services.storytelling import StorytellingService

router = APIRouter()

@router.post("/generate/{user_id}", response_model=StoryResponse, status_code=status.HTTP_201_CREATED)
async def generate_story(
    user_id: uuid.UUID,
    request: StoryGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Gera uma nova narrativa sensorial de manifestação em 1ª pessoa no presente,
    combinando as dimensões psicológicas do usuário e/ou intenções sob demanda.
    """
    # 1. Valida existência do usuário
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # 2. Carrega perfil psicológico (se preenchido)
    profile_stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()

    # 3. Gera a história com o serviço de Storytelling IA
    story_data = await StorytellingService.generate_story(
        profile=profile,
        user_prompt=request.prompt,
        category=request.category
    )

    # 4. Salva a nova história no banco de dados
    new_story = Story(
        user_id=user_id,
        title=story_data.get("title", "Minha Nova Manifestação"),
        prompt_used=request.prompt,
        narrative_text=story_data.get("narrative_text", ""),
        category=story_data.get("category", request.category or "abundance"),
        status="generated",
        is_daily=True
    )
    db.add(new_story)
    await db.flush()

    # 5. Inicializa a sessão de áudio associada
    ambient = story_data.get("ambient_recommendation") or request.ambient_sound or "binaural_432hz"
    audio_session = AudioSession(
        story_id=new_story.id,
        voice_id="21m00Tcm4TlvDq8ikWAM",
        voice_name="Aura",
        ambient_sound=ambient,
        status="pending"
    )
    db.add(audio_session)
    await db.commit()

    # Recarrega com relacionamento
    stmt = (
        select(Story)
        .where(Story.id == new_story.id)
        .options(selectinload(Story.audio))
    )
    result = await db.execute(stmt)
    return result.scalar_one()

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
