from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "mysql+aiomysql://root:root@localhost:3306/collaborative_editor"
    SYNC_DATABASE_URL: str = "mysql+pymysql://root:root@localhost:3306/collaborative_editor"

    # CORS settings - include all possible origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://nikhil1479.github.io",
        "https://nikhil1479.github.io/",
        "https://nikhil1479.github.io/Collaborative-Editor",
        "https://nikhil1479.github.io/Collaborative-Editor/",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
