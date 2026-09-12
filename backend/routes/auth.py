"""
Rotas de autenticacao - login do admin + area "Minha conta"
"""
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Admin
from schemas import LoginRequest, AdminMe, AdminUpdateEmail, AdminChangePassword, AdminAvatarSeed
from security import (
    verify_password,
    hash_password,
    create_access_token,
    get_current_admin,
    settings,
)
from seeder import finalize_login
from upload_paths import admin_folder

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Rate limit simples baseado em IP (na memoria): bloqueia apos 5 FALHAS / 5 min
_login_attempts: dict[str, list[datetime]] = {}
MAX_ATTEMPTS = 5
LOCK_MINUTES = 5

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


def _failed_attempts(ip: str) -> list[datetime]:
    """Retorna as falhas recentes do IP, descartando as mais antigas que 5 min."""
    now = datetime.utcnow()
    attempts = [t for t in _login_attempts.get(ip, []) if t > now - timedelta(minutes=5)]
    _login_attempts[ip] = attempts
    return attempts


def register_failure(ip: str):
    _login_attempts.setdefault(ip, []).append(datetime.utcnow())


def clear_failures(ip: str):
    """Login com sucesso zera as falhas registradas para o IP."""
    _login_attempts.pop(ip, None)


@router.post("/login")
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    ip = req.client.host if req.client else "unknown"

    # Bloqueia somente por FALHAS recentes (logins de sucesso nao contam)
    if len(_failed_attempts(ip)) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Muitas tentativas de login. Aguarde 5 minutos.",
        )

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
        register_failure(ip)
        admin.login_attempts += 1
        if admin.login_attempts >= 5:
            admin.locked_until = datetime.utcnow() + timedelta(minutes=LOCK_MINUTES)
            admin.login_attempts = 0
        db.commit()
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")

    # Sucesso: gera token e limpa falhas registradas para o IP
    clear_failures(ip)
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


# ---------- Area "Minha conta" (exige admin autenticado) ----------
def _load_admin(db: Session) -> Admin:
    """Carrega o unico admin do banco."""
    admin = db.query(Admin).first()
    if not admin:
        raise HTTPException(status_code=500, detail="Admin nao configurado. Reinicie o backend.")
    return admin


def _admin_me(admin: Admin) -> AdminMe:
    return AdminMe(email=admin.email, avatar_seed=admin.avatar_seed, avatar_path=admin.avatar_path)


@router.get("/me", response_model=AdminMe)
def get_me(
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    return _admin_me(_load_admin(db))


@router.put("/email", response_model=AdminMe)
def update_email(
    data: AdminUpdateEmail,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Troca o e-mail exigindo a senha atual (confirmacao)."""
    admin = _load_admin(db)
    if not verify_password(data.password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Senha atual incorreta")

    new_email = data.email.strip().lower()
    if not 5 <= len(new_email) <= 255 or "@" not in new_email or "." not in new_email:
        raise HTTPException(status_code=400, detail="Email invalido")

    existing = db.query(Admin).filter(Admin.email == new_email, Admin.id != admin.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email ja em uso")

    admin.email = new_email
    db.commit()
    db.refresh(admin)
    return _admin_me(admin)


@router.put("/password")
def change_password(
    data: AdminChangePassword,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Troca a senha exigindo a senha atual."""
    admin = _load_admin(db)
    if not verify_password(data.current_password, admin.password_hash):
        raise HTTPException(status_code=401, detail="Senha atual incorreta")

    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 8 caracteres")
    if data.new_password == data.current_password:
        raise HTTPException(status_code=400, detail="A nova senha deve ser diferente da atual")

    admin.password_hash = hash_password(data.new_password)
    # Nova senha limpa bloqueios/contagem de tentativas
    admin.login_attempts = 0
    admin.locked_until = None
    db.commit()
    return {"message": "Senha alterada com sucesso"}


@router.put("/avatar", response_model=AdminMe)
def set_avatar_seed(
    data: AdminAvatarSeed,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Define avatar pre-definido (seed do DiceBear Lorelei) ou remove."""
    seed = (data.avatar_seed or "").strip()
    admin = _load_admin(db)

    if seed:
        if len(seed) > 100:
            raise HTTPException(status_code=400, detail="Seed muito longo")
        admin.avatar_seed = seed
        # Imagem enviada deixa de valer quando um pre-definido e escolhido
        if admin.avatar_path:
            old_path = os.path.join(settings.UPLOAD_DIR, admin.avatar_path)
            if os.path.exists(old_path):
                os.remove(old_path)
            admin.avatar_path = None
    else:
        # Seed vazio = remove o avatar atual (pre-definido e/ou imagem enviada)
        admin.avatar_seed = None
        if admin.avatar_path:
            old_path = os.path.join(settings.UPLOAD_DIR, admin.avatar_path)
            if os.path.exists(old_path):
                os.remove(old_path)
            admin.avatar_path = None

    db.commit()
    db.refresh(admin)
    return _admin_me(admin)


@router.post("/avatar", response_model=AdminMe)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Envia uma imagem propria como avatar."""
    admin = _load_admin(db)

    original_filename = file.filename or "avatar"
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail=f"Formato de imagem nao permitido: {ext}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Imagem muito grande (max 10MB)")

    if admin.avatar_path:
        old_path = os.path.join(settings.UPLOAD_DIR, admin.avatar_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    upload_path = os.path.join(settings.UPLOAD_DIR, admin_folder())
    os.makedirs(upload_path, exist_ok=True)
    full_path = os.path.join(upload_path, f"avatar{ext}")

    with open(full_path, "wb") as f:
        f.write(content)

    admin.avatar_path = os.path.relpath(full_path, settings.UPLOAD_DIR)
    # Imagem enviada prevalece sobre o pre-definido
    admin.avatar_seed = None
    db.commit()
    db.refresh(admin)
    return _admin_me(admin)


@router.get("/avatar")
def serve_avatar(
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    """Serve o avatar enviado (imagem) apenas para o admin autenticado."""
    admin = db.query(Admin).first()
    if not admin or not admin.avatar_path:
        raise HTTPException(status_code=404, detail="Avatar nao encontrado")

    full_path = os.path.join(settings.UPLOAD_DIR, admin.avatar_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Arquivo fisico nao encontrado")

    ext = os.path.splitext(full_path)[1].lower()
    media_type = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    }.get(ext, "application/octet-stream")

    return FileResponse(path=full_path, media_type=media_type, content_disposition_type="inline")