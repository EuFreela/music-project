"""
Script de reset de senha do admin.

Uso:
    python reset_admin.py                  # gera senha nova aleatoria
    python reset_admin.py "MinhaSenha123"  # define senha especifica

Mostra as credenciais na tela. O admin NAO precisara ser recriado.
"""
import sys
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Admin
from security import hash_password, generate_password


def reset_admin(db: Session, new_password: str | None = None):
    admin = db.query(Admin).first()

    if not admin:
        print("[ERRO] Nenhum admin encontrado. Reinicie o backend para criar.", flush=True)
        sys.exit(1)

    password = new_password.strip() if new_password and new_password.strip() else generate_password()

    admin.password_hash = hash_password(password)
    admin.login_attempts = 0
    admin.locked_until = None
    db.commit()

    print("", flush=True)
    print("=" * 52, flush=True)
    print(" *** SENHA DO ADMIN RESETADA ***", flush=True)
    print("=" * 52, flush=True)
    print(f"   Email:    {admin.email}", flush=True)
    print(f"   Senha:    {password}", flush=True)
    print("=" * 52, flush=True)
    print("   [ATENCAO] ANOTE ESSA SENHA", flush=True)
    print("=" * 52, flush=True)
    print("", flush=True)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        reset_admin(db, sys.argv[1] if len(sys.argv) > 1 else None)
    finally:
        db.close()