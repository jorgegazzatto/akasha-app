from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de Backend do Akasha App: Orquestração de Storytelling IA, Síntese de Voz e Gestão de Manifestações.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configuração de CORS para permitir acesso de Mobile (Expo) e Web (PC/Tablet)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Rotas da API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Bem-vindo à API do Akasha App ✨",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
