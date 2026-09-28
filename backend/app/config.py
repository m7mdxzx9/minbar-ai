"""
Configuration settings for Minbar AI
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Minbar AI (منبر الذكاء الاصطناعي)"
    VERSION: str = "1.0.0"
    THEOLOGICAL_CREED: str = "Ahl al-Sunnah wal-Jama'ah"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./minbar.db")
    CORS_ORIGINS: list = ["*"]
    MAX_VERIFICATION_THRESHOLD: float = 0.98

    class Config:
        case_sensitive = True


settings = Settings()
