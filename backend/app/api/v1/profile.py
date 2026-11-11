import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.profile import ProfileCreate, ProfileResponse

router = APIRouter()

@router.get("/{user_id}/profile", response_model=ProfileResponse)
async def get_user_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna o perfil com as 5 dimensões psicológicas mapeadas no onboarding.
    """
    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de onboarding ainda não preenchido para este usuário."
        )
    return profile

@router.post("/{user_id}/profile", response_model=ProfileResponse)
async def save_or_update_profile(
    user_id: uuid.UUID,
    profile_in: ProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Salva ou atualiza as respostas do Onboarding profundo em 5 dimensões.
    """
    # Verifica se usuário existe
    user_stmt = select(User).where(User.id == user_id)
    user_res = await db.execute(user_stmt)
    user = user_res.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    stmt = select(UserProfile).where(UserProfile.user_id == user_id)
    result = await db.execute(stmt)
    profile = result.scalar_one_or_none()

    profile_data = profile_in.model_dump(exclude_unset=True)

    if profile:
        for key, value in profile_data.items():
            setattr(profile, key, value)
    else:
        profile = UserProfile(user_id=user_id, **profile_data)
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return profile

