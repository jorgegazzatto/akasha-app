import os
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.story import Story
from app.models.user import User
from app.models.audio import AudioSession
from app.schemas.audio import AudioResponse
from app.services.smart_audio import SmartAudioService, MASTERED_DIR

router = APIRouter()

@router.post("/generate/{story_id}", response_model=AudioResponse)
async def generate_story_audio(
    story_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Aciona o pipeline de Smart Tiering de áudio:
    - Verifica cache (se já foi gerado, não gasta nada).
    - Se usuário é free: síntese otimizada + masterização FFmpeg (EQ Warm + 432Hz).
    - Se usuário é premium: vozes exclusivas / clone de voz próprio.
    """
    stmt = (
        select(Story)
        .where(Story.id == story_id)
        .options(selectinload(Story.audio), selectinload(Story.user))
    )
    result = await db.execute(stmt)
    story = result.scalar_one_or_none()

    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="História não encontrada."
        )

    user = story.user
    user_tier = user.subscription_tier if user else "free"
    voice_clone_id = user.voice_clone_id if user else None

    audio = story.audio
    if not audio:
        audio = AudioSession(
            story_id=story.id,
            voice_id="nova",
            ambient_sound="binaural_432hz",
            status="processing"
        )
        db.add(audio)
        await db.flush()

    audio.status = "processing"
    await db.commit()

    # Executa a síntese e masterização com Smart Tiering
    try:
        final_path, duration = await SmartAudioService.synthesize_and_master(
            text=story.narrative_text,
            user_tier=user_tier,
            voice_id=audio.voice_id,
            voice_clone_id=voice_clone_id,
            ambient_sound=audio.ambient_sound
        )
        filename = os.path.basename(final_path)
        audio.audio_url = f"/api/v1/audio/stream/{filename}"
        audio.duration_seconds = duration
        audio.status = "ready"
        story.status = "completed"
        await db.commit()
        await db.refresh(audio)
        return audio

    except Exception as e:
        audio.status = "failed"
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na produção do áudio: {str(e)}"
        )

@router.get("/stream/{filename}")
async def stream_audio_file(filename: str, request: Request):
    """
    Endpoint de streaming de alta performance com suporte a Range requests (HTTP 206 Partial Content).
    Permite scrubbing suave e reprodução instantânea no Expo e navegadores.
    """
    safe_filename = os.path.basename(filename)
    filepath = os.path.join(MASTERED_DIR, safe_filename)

    if not os.path.exists(filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo de áudio não encontrado."
        )

    file_size = os.path.getsize(filepath)
    range_header = request.headers.get("range")

    if range_header:
        # Ex: "bytes=0-1024"
        try:
            byte_range = range_header.replace("bytes=", "").split("-")
            start = int(byte_range[0])
            end = int(byte_range[1]) if byte_range[1] else file_size - 1
        except ValueError:
            start = 0
            end = file_size - 1

        chunk_size = (end - start) + 1

        def iter_file():
            with open(filepath, "rb") as f:
                f.seek(start)
                bytes_left = chunk_size
                while bytes_left > 0:
                    read_size = min(bytes_left, 64 * 1024)
                    chunk = f.read(read_size)
                    if not chunk:
                        break
                    bytes_left -= len(chunk)
                    yield chunk

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": "audio/mpeg",
        }
        return StreamingResponse(iter_file(), status_code=206, headers=headers)

    def iter_full():
        with open(filepath, "rb") as f:
            while chunk := f.read(64 * 1024):
                yield chunk

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(file_size),
        "Content-Type": "audio/mpeg",
    }
    return StreamingResponse(iter_full(), headers=headers)

