from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine
from app.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializa tabelas no banco de dados caso não existam
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Tabelas do banco de dados inicializadas com sucesso.")
    except Exception as e:
        print(f"Aviso na inicialização do banco: {e}")
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API de Backend do Akasha App: Orquestração de Storytelling IA, Síntese de Voz e Gestão de Manifestações.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
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
