import json
import logging
from typing import Optional, Dict, Any
from app.core.config import settings
from app.models.profile import UserProfile

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Você é o roteirista mestre do Akasha App. Sua missão é escrever uma narrativa de manifestação imersiva, vívida e emocional em PRIMEIRA PESSOA DO PRESENTE ("Eu vejo...", "Eu sinto...").

DIRETRIZES FUNDAMENTAIS:
1. Tom: Sereno, sensorial, íntimo, empoderador, poético e sem clichês vazios. Descreva sensações térmicas, aromas, texturas, luzes e sentimentos do corpo.
2. Formato: Narrativa contínua dividida em 3 atos:
   - Ato 1: Ancoragem no ambiente presente (detalhes do lar e da atmosfera ao redor).
   - Ato 2: O acontecimento da realização e celebração (conquistas materiais, afetivas e profissionais).
   - Ato 3: Gratidão profunda e paz interior pelo momento vivido.
3. Integração dos Dados do Usuário: Integre com extrema naturalidade os elementos do perfil fornecidos (nome da pessoa amada, lar dos sonhos, cidade, aspirações).
4. Transmutação: Aborde sutilmente o alívio de ter deixado para trás as antigas inseguranças e desafios, celebrando a serenidade do estado presente.
5. Extensão: Entre 350 e 450 palavras (ritmo pausado para meditação guiada).
6. Ritmo: Use vírgulas e pontos estratégicos para permitir pausas naturais na futura narração por voz.
7. Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "title": "Título poético e evocativo em 1ª pessoa (ex: Sinto o aroma do café fresco enquanto Simone sorri na nossa varanda)",
  "narrative_text": "O texto completo da narrativa em primeira pessoa do presente...",
  "category": "abundance|love|career|peace|health|spirituality",
  "ambient_recommendation": "binaural_432hz|rain|fireplace|ocean_waves"
}
"""

class StorytellingService:
    @staticmethod
    async def generate_story(
        profile: Optional[UserProfile],
        user_prompt: Optional[str] = None,
        category: Optional[str] = "abundance"
    ) -> Dict[str, Any]:
        """
        Gera uma narrativa personalizada de manifestação utilizando Gemini ou OpenAI,
        com fallback inteligente caso nenhuma chave de API esteja configurada no ambiente.
        """
        user_context = StorytellingService._build_user_context(profile, user_prompt, category)

        # 1. Tentativa com Gemini API
        if settings.GEMINI_API_KEY:
            try:
                story = await StorytellingService._call_gemini(user_context)
                if story:
                    return story
            except Exception as e:
                logger.warning(f"Erro ao chamar Gemini API: {e}. Tentando fallback.")

        # 2. Tentativa com OpenAI API
        if settings.OPENAI_API_KEY:
            try:
                story = await StorytellingService._call_openai(user_context)
                if story:
                    return story
            except Exception as e:
                logger.warning(f"Erro ao chamar OpenAI API: {e}. Tentando fallback.")

        # 3. Fallback Sensorial Contextualizado (Garante disponibilidade imediata)
        return StorytellingService._generate_fallback_story(profile, user_prompt, category)

    @staticmethod
    def _build_user_context(
        profile: Optional[UserProfile],
        user_prompt: Optional[str],
        category: Optional[str]
    ) -> str:
        ctx_parts = []
        if profile:
            if profile.preferred_name:
                ctx_parts.append(f"- Nome da pessoa: {profile.preferred_name}")
            if profile.occupation:
                ctx_parts.append(f"- Profissão/Atuação: {profile.occupation}")
            if profile.loved_one_name:
                ctx_parts.append(f"- Pessoa amada / parceiro(a): {profile.loved_one_name}")
            if profile.loved_one_qualities:
                ctx_parts.append(f"- Qualidades da pessoa amada: {profile.loved_one_qualities}")
            if profile.dream_home_style:
                ctx_parts.append(f"- Lar dos sonhos: {profile.dream_home_style}")
            if profile.dream_cities and isinstance(profile.dream_cities, list) and len(profile.dream_cities) > 0:
                ctx_parts.append(f"- Cidades dos sonhos: {', '.join(profile.dream_cities)}")
            if profile.deep_aspirations:
                ctx_parts.append(f"- Aspirações profundas: {profile.deep_aspirations}")
            if profile.career_feelings:
                ctx_parts.append(f"- Sentimento na carreira: {profile.career_feelings}")
            if profile.current_challenges:
                ctx_parts.append(f"- Desafio transmutado: {profile.current_challenges}")

        if user_prompt:
            ctx_parts.append(f"- Intenção específica do dia solicitada pelo usuário: \"{user_prompt}\"")
        if category:
            ctx_parts.append(f"- Categoria temática: {category}")

        return "\n".join(ctx_parts)

    @staticmethod
    async def _call_gemini(user_context: str) -> Optional[Dict[str, Any]]:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"parts": [{"text": f"Gere a história de manifestação para este perfil:\n\n{user_context}"}]}],
            "generationConfig": {
                "temperature": 0.8,
                "response_mime_type": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        return None

    @staticmethod
    async def _call_openai(user_context: str) -> Optional[Dict[str, Any]]:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.8,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Gere a história de manifestação para este perfil:\n\n{user_context}"}
            ]
        )
        content = response.choices[0].message.content
        return json.loads(content)

    @staticmethod
    def _generate_fallback_story(
        profile: Optional[UserProfile],
        user_prompt: Optional[str],
        category: Optional[str]
    ) -> Dict[str, Any]:
        """
        Gera uma narrativa rica e sensorial baseada nas dimensões do perfil
        mesmo sem chamadas a APIs externas.
        """
        name = profile.preferred_name if profile and profile.preferred_name else "mim"
        partner = profile.loved_one_name if profile and profile.loved_one_name else "quem amo"
        home = profile.dream_home_style if profile and profile.dream_home_style else "meu refúgio de paz"
        city = (profile.dream_cities[0] if profile and profile.dream_cities and len(profile.dream_cities) > 0 else "um horizonte tranquilo")
        aspiration = profile.deep_aspirations if profile and profile.deep_aspirations else "viver com plenitude, leveza e propósito"
        intention = f" ao redor de {user_prompt}" if user_prompt else ""

        title = f"O sol da manhã ilumina {home} enquanto celebro com {partner}"

        narrative_text = (
            f"Eu abro os olhos e sinto a brisa suave entrando pela janela, trazendo o frescor acolhedor desta manhã em {city}. "
            f"O ar carrega uma calma que preenche cada canto de {home}. Eu me levanto sem pressa, sentindo o chão firme sob os meus pés, "
            f"com o coração inteiramente preenchido por uma certeza inabalável: tudo o que eu busquei, agora é a minha realidade.\n\n"
            f"Caminho pela casa e vejo {partner} na cozinha, preparando o café da manhã. Nossos olhares se cruzam com a cumplicidade "
            f"de quem construiu uma vida lado a lado, superando cada fase com ternura e sabedoria. O aroma do café fresco se espalha, "
            f"e eu respiro fundo, saboreando a beleza dos detalhes cotidianos. Aquele antigo peso das incertezas se dissolveu por completo, "
            f"dando lugar a uma clareza serena sobre quem eu sou e o impacto que realizo no mundo.\n\n"
            f"Hoje, meus projetos florescem com naturalidade{intention}. Cada decisão que tomo reverbera em abundância e harmonia, "
            f"permitindo que eu desfrute de {aspiration}. Eu caminho até a varanda, sinto os raios dourados do sol aquecerem o meu rosto "
            f"e coloco as mãos sobre o peito. Eu sinto o pulsar constante da vida dentro de mim. Tudo está no seu devido lugar. "
            f"Eu pertenço a esta paz, eu honro o meu caminho e celebro a alegria infinita de estar presente neste agora."
        )

        return {
            "title": title,
            "narrative_text": narrative_text,
            "category": category or "abundance",
            "ambient_recommendation": "binaural_432hz"
        }

