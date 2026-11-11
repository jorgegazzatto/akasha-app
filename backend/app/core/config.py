from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Akasha App API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Segurança
    SECRET_KEY: str = "default_secret_key_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 dias
    
    # Banco & Cache
    DATABASE_URL: str = "postgresql+asyncpg://akasha_user:akasha_secure_pass@localhost:5432/akasha_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # APIs de Inteligência Artificial
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""
    
    # Cloudflare R2 Storage (Zero Egress)
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "akasha-audios"
    R2_PUBLIC_DOMAIN: str = "https://audios.akashaapp.com"
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:8081,http://localhost:3000,http://localhost:19006,https://app.seudominio.com"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
