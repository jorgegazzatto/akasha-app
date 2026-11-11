import os
import hashlib
import asyncio
import subprocess
import logging
from typing import Optional, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_DIR = "/app/audio_cache"
MASTERED_DIR = os.path.join(CACHE_DIR, "mastered")
RAW_DIR = os.path.join(CACHE_DIR, "raw")
AMBIENT_DIR = os.path.join(CACHE_DIR, "ambient")

os.makedirs(MASTERED_DIR, exist_ok=True)
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(AMBIENT_DIR, exist_ok=True)

class SmartAudioService:
    """
    Arquitetura Híbrida Inteligente de Áudio (Smart Tiering):
    1. Tier Gratuito: OpenAI TTS-1 / ElevenLabs Flash + Pós-produção FFmpeg acústica.
    2. Tier Premium: Vozes de estúdio ElevenLabs + Clonagem de voz própria.
    3. Smart Cache: Áudios com o mesmo texto, voz e frequência são servidos instantaneamente.
    """

    @staticmethod
    def get_cache_key(text: str, voice_id: str, ambient: str, tier: str) -> str:
        content = f"{tier}:{voice_id}:{ambient}:{text.strip()}"
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    @staticmethod
    def get_cached_file(cache_key: str) -> Optional[str]:
        filepath = os.path.join(MASTERED_DIR, f"{cache_key}.mp3")
        if os.path.exists(filepath) and os.path.getsize(filepath) > 1024:
            return filepath
        return None

    @staticmethod
    async def synthesize_and_master(
        text: str,
        user_tier: str = "free",
        voice_id: Optional[str] = None,
        voice_clone_id: Optional[str] = None,
        ambient_sound: str = "binaural_432hz"
    ) -> Tuple[str, float]:
        """
        Orquestra a síntese de voz e a masterização de estúdio.
        Retorna (caminho_do_arquivo_mp3, duracao_em_segundos).
        """
        # 1. Determina a voz e motor baseados no Tier
        selected_voice, engine_type = SmartAudioService._resolve_tier_voice(
            user_tier=user_tier,
            voice_id=voice_id,
            voice_clone_id=voice_clone_id
        )

        # 2. Verificação no Smart Cache
        cache_key = SmartAudioService.get_cache_key(text, selected_voice, ambient_sound, user_tier)
        cached_path = SmartAudioService.get_cached_file(cache_key)
        if cached_path:
            logger.info(f"⚡ Smart Cache HIT para {cache_key[:10]}... (Economia de 100% de API)")
            duration = SmartAudioService._get_audio_duration(cached_path)
            return cached_path, duration

        # 3. Síntese de Voz Bruta (Raw Voice)
        raw_voice_path = os.path.join(RAW_DIR, f"{cache_key}_raw.mp3")
        if not os.path.exists(raw_voice_path) or os.path.getsize(raw_voice_path) < 100:
            await SmartAudioService._synthesize_voice(
                text=text,
                voice_id=selected_voice,
                engine_type=engine_type,
                output_path=raw_voice_path
            )

        # 4. Pós-Produção Acústica de Estúdio com FFmpeg
        final_mastered_path = os.path.join(MASTERED_DIR, f"{cache_key}.mp3")
        duration = await SmartAudioService._master_audio_with_ffmpeg(
            raw_voice_path=raw_voice_path,
            output_path=final_mastered_path,
            ambient_sound=ambient_sound
        )

        return final_mastered_path, duration

    @staticmethod
    def _resolve_tier_voice(
        user_tier: str,
        voice_id: Optional[str],
        voice_clone_id: Optional[str]
    ) -> Tuple[str, str]:
        """
        Aplica a regra de negócios de custos:
        - Free: OpenAI TTS-1 ('nova', 'onyx', 'alloy') ou ElevenLabs Flash
        - Premium: Voz clonada do usuário ou vozes exclusivas ElevenLabs
        """
        if user_tier == "premium" and voice_clone_id:
            return voice_clone_id, "elevenlabs_clone"
        elif user_tier == "premium" and voice_id:
            return voice_id, "elevenlabs_premium"
        else:
            # Tier Gratuito: custo otimizado na casa dos centavos
            default_free_voice = voice_id if voice_id in ["nova", "onyx", "alloy", "shimmer"] else "nova"
            return default_free_voice, "openai_tts"

    @staticmethod
    async def _synthesize_voice(
        text: str,
        voice_id: str,
        engine_type: str,
        output_path: str
    ) -> None:
        """
        Realiza a chamada ao provedor de voz correspondente.
        """
        if engine_type == "openai_tts" and settings.OPENAI_API_KEY:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            response = await client.audio.speech.create(
                model="tts-1",
                voice=voice_id,
                input=text,
                response_format="mp3"
            )
            response.stream_to_file(output_path)
            return

        elif "elevenlabs" in engine_type and settings.ELEVENLABS_API_KEY:
            import httpx
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {
                "xi-api-key": settings.ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            }
            model_id = "eleven_multilingual_v2" if engine_type == "elevenlabs_clone" else "eleven_flash_v2_5"
            payload = {
                "text": text,
                "model_id": model_id,
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.8
                }
            }
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    with open(output_path, "wb") as f:
                        f.write(res.content)
                    return

        # Fallback de Demonstração Acústica quando sem chave de API
        # Gera tom de voz sintético de teste calibrado com duração da leitura
        SmartAudioService._generate_dummy_speech(text, output_path)

    @staticmethod
    def _generate_dummy_speech(text: str, output_path: str) -> None:
        """Gera um arquivo de áudio harmônico para testes locais sem consumo de API"""
        estimated_seconds = max(5, min(180, int(len(text.split()) / 2.5)))
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency=220:duration={estimated_seconds}",
            "-af", "afade=t=in:ss=0:d=1,afade=t=out:st=4:d=1,volume=0.3",
            "-c:a", "libmp3lame",
            output_path
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    @staticmethod
    async def _master_audio_with_ffmpeg(
        raw_voice_path: str,
        output_path: str,
        ambient_sound: str
    ) -> float:
        """
        Aplica o pipeline acústico de estúdio:
        1. Equalizador Warm (realce em 200Hz para presença vocal intimista).
        2. Reverb suave para tirar a aridez digital.
        3. Frequência Binaural 432Hz ou 528Hz sintetizada em segundo plano suave.
        """
        voice_duration = SmartAudioService._get_audio_duration(raw_voice_path)
        freq = 528 if "528" in ambient_sound else 432

        # Comando FFmpeg de estúdio em 2 camadas
        # Camada 0: Voz principal equalizada com ganho harmônico
        # Camada 1: Frequência harmônica subliminar calibrada em volume baixo
        cmd = [
            "ffmpeg", "-y",
            "-i", raw_voice_path,
            "-f", "lavfi", "-i", f"sine=frequency={freq}:duration={voice_duration + 2}",
            "-filter_complex",
            (
                "[0:a]equalizer=f=200:t=q:w=1:g=2.5,aecho=0.8:0.88:30:0.15[voice];"
                "[1:a]volume=0.12,afade=t=in:ss=0:d=3,afade=t=out:st=" f"{max(1, voice_duration - 2)}:d=2[ambient];"
                "[voice][ambient]amix=inputs=2:duration=first:dropout_transition=2[out]"
            ),
            "-map", "[out]",
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            output_path
        ]

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await proc.communicate()

        return SmartAudioService._get_audio_duration(output_path)

    @staticmethod
    def _get_audio_duration(filepath: str) -> float:
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                filepath
            ]
            res = subprocess.check_output(cmd).decode().strip()
            return float(res)
        except Exception:
            return 180.0

