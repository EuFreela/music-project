"""
Configuracoes globais - carrega variaveis do .env
"""
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Carrega .env apenas em desenvolvimento
load_dotenv()

class Settings:
    # Admin
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@musicproject.com")

    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-123456789")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Database MySQL
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "music_project")

    # DB_PASSWORD com URL-encoding (suporta caracteres especiais como @)
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

    # Uploads
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"))
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

    # Rate limit login
    LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "5/minute")

settings = Settings()