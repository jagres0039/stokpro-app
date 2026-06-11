from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "StokPro API"
    API_V1_PREFIX: str = "/api/v1"

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "postgresql+psycopg://stokpro:stokpro@localhost:5432/stokpro"

    # CORS (comma-separated)
    CORS_ALLOW_ORIGINS: str = "http://localhost:5173"

    @field_validator("JWT_SECRET")
    @classmethod
    def _validate_secret(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError("JWT_SECRET must be set and at least 32 characters long")
        return v

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ALLOW_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
