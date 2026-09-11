"""
Music Project Manager - Backend API
Autor: Music Project
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import SessionLocal
from config import settings
from seeder import init_admin

# Importa models para o metadata do SQLAlchemy
import models  # noqa: F401
from alembic import command
from alembic.config import Config


def run_migrations() -> None:
    """Aplica migracoes Alembic (equivalente a `alembic upgrade head`)."""
    alembic_ini = os.path.join(os.path.dirname(os.path.abspath(__file__)), "alembic.ini")
    cfg = Config(alembic_ini)
    command.upgrade(cfg, "head")
    print("[OK] Migracoes Alembic aplicadas")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Aplica migracoes de schema (Alembic) - cria/atualiza tabelas
    run_migrations()

    # 2. Cria admin automaticamente na 1a execucao (mostra credenciais)
    db = SessionLocal()
    try:
        init_admin(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="Music Project Manager API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - em producao, restringir ao dominio do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Middleware de seguranca de headers ----------
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


# ---------- Rotas ----------
from routes import auth, projects, tracks, collaborators, uploads, artists  # noqa: E402

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tracks.router)
app.include_router(collaborators.router)
app.include_router(uploads.router)
app.include_router(artists.router)


# ---------- Health check ----------
@app.get("/api/health")
def health():
    return {"status": "ok", "name": "Music Project Manager", "version": app.version}


# ---------- 404 padrao ----------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)