"""
Rotas de autenticacao - login do admin
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Admin
from schemas import LoginRequest
from security import verify_password, create_access_token, settings
from seeder import finalize_login

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Rate limit simples baseado em IP (na memoria)
_login_attempts: dict[str, list[datetime]] = {}
MAX_ATTEMPTS = 5
LOCK_MINUTES = 5


def check_rate_limit(ip: str):
    """Permite 5 tentativas / 5 minutos por IP"""
    now = datetime.utcnow()
    attempts = [t for t in _login_attempts.get(ip, []) if t > now - timedelta(minutes=5)]

    if len(attempts) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Muitas tentativas de login. Aguarde 5 minutos.",
        )

    attempts.append(now)
    _login_attempts[ip] = attempts


@router.post("/login")
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    ip = req.client.host if req.client else "unknown"
    check_rate_limit(ip)

    admin = db.query(Admin).first()

    if not admin:
        raise HTTPException(status_code=500, detail="Admin nao configurado. Reinicie o backend.")

    # Bloqueio temporario apos muitas falhas
    if admin.locked_until and admin.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=429,
            detail="Conta temporariamente bloqueada. Aguarde alguns minutos.",
        )

    if admin.email != request.email or not verify_password(request.password, admin.password_hash):
        admin.login_attempts += 1
        if admin.login_attempts >= 5:
            admin.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_MINUTES)
            admin.login_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    # Sucesso: gera token
    token = create_access_token(subject="admin")
    finalize_login(db)

    response = JSONResponse(
        status_code=200,
        content={"token": token, "message": "Login realizado com sucesso"},
    )
    return response


@router.post("/logout")
def logout():
    """Cliente descarta o token localmente."""
    return {"message": "Logout realizado"}