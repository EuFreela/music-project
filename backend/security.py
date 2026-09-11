"""
Seguranca: hash de senhas, JWT, dependencias de autenticacao
"""
import secrets
import string
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings
from models import Admin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


# ---------- Senhas ----------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def generate_password(length: int = 16) -> str:
    """Gera senha forte aleatoria usando secrets (criptograficamente seguro)"""
    alphabet = string.ascii_letters + string.digits + "#$%&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ---------- JWT ----------
def create_access_token(subject: str, expires_minutes: int = None) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> Optional[str]:
    """Retorna o subject do token se valido, senao None"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ---------- Dependency para rotas protegidas ----------
def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Admin:
    """Verifica Bearer token e retorna o Admin"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nao autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    subject = verify_token(credentials.credentials)
    if subject != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido ou expirado",
        )
    return Admin()  # admin unico, nao precisa buscar no banco