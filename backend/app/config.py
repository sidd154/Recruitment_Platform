import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core AI Secrets
    OPENAI_API_KEY: str = ""
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_RESUME_BUCKET: str = "resumes"
    
    # Application Constants
    AI_MODEL_NAME: str = "gpt-4o"
    PASS_THRESHOLD: float = 70.0
    
    # Demo Account IDs (as requested by user)
    DEMO_CANDIDATE_ID: str = "00000000-0000-0000-0000-000000000001"
    DEMO_RECRUITER_ID: str = "00000000-0000-0000-0000-000000000002"
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Email Service (placeholders)
    SMTP_HOST: str = "your_smtp_host"
    SMTP_PORT: int = 587
    SMTP_USER: str = "your_smtp_user"
    SMTP_PASSWORD: str = "your_smtp_password"
    SMTP_FROM: str = "noreply@skillbridge.dev"

settings = Settings()
