from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "mysql+aiomysql://root:root@localhost:3306/collaborative_editor"
    SYNC_DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/collaborative_editor"

    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://nikhil1479.github.io"
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
