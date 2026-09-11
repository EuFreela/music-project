"""
Seeder: cria admin automaticamente na primeira execucao
"""
from datetime import datetime
from sqlalchemy.orm import Session
from models import Admin
from security import hash_password, generate_password
from config import settings

BADGE = "*** ADMIN CRIADO AUTOMATICAMENTE ***"


def _print_creds(email: str, password: str):
    """Exibe credenciais UMA vez, sempre com flush para nao perder no console."""
    lines = [
        "",
        "=" * 52,
        f" {BADGE}",
        "=" * 52,
        f"   Email:    {email}",
        f"   Senha:    {password}",
        "=" * 52,
        "   [ATENCAO] ANOTE ESSA SENHA - ELA NAO SERA MOSTRADA NOVAMENTE",
        "=" * 52,
        "",
    ]
    for line in lines:
        print(line, flush=True)


def init_admin(db: Session):
    """Cria o admin na primeira execucao.

    Se ADMIN_PASSWORD estiver definido no .env, as credenciais do admin
    sao sincronizadas com o .env a cada startup (o .env e a fonte da verdade).
    Caso contrario, cria com senha aleatoria mostrada UMA vez no console.
    """
    admin = db.query(Admin).first()
    email = settings.ADMIN_EMAIL
    password = settings.ADMIN_PASSWORD

    if admin:
        if password:
            # .env mandou: garante email/senha do env, zera bloqueio
            admin.email = email
            admin.password_hash = hash_password(password)
            admin.login_attempts = 0
            admin.locked_until = None
            db.commit()
            print(f"[OK] Credenciais do admin sincronizadas com o .env ({email})", flush=True)
            return admin
        return None  # admin ja existe, sem ADMIN_PASSWORD no env

    if not password:
        password = generate_password()

    new_admin = Admin(
        email=email,
        password_hash=hash_password(password),
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    _print_creds(email, password)

    return new_admin


def finalize_login(db: Session):
    """Registra ultimo login, zera tentativas."""
    admin = db.query(Admin).first()
    if admin:
        admin.last_login = datetime.utcnow()
        admin.login_attempts = 0
        admin.locked_until = None
        db.commit()