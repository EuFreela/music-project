"""
Conexao com o banco de dados MySQL usando SQLAlchemy
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # verifica conexao antes de usar
    pool_recycle=3600,        # recicla conexoes a cada hora
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency para injetar sessao do banco nas rotas"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()