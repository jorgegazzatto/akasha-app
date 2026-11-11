from fastapi import APIRouter
from app.api.v1 import health

api_router = APIRouter()

# Rota de verificação do sistema
api_router.include_router(health.router, tags=["Health"])
