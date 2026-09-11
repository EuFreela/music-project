"""
Rotas de upload/download de arquivos - PROTEGIDAS

NUNCA serve arquivos estaticamente. Todo acesso passa por
autenticacao + verificacao de posse do projeto.
"""
import os
import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db
from models import Project, ProjectFile
from schemas import ProjectFileResponse
from security import get_current_admin
from config import settings

router = APIRouter(prefix="/api/projects/{project_id}/files", tags=["files"], dependencies=[Depends(get_current_admin)])

ALLOWED_TYPES = {
    "audio": {".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"},
    "image": {".jpg", ".jpeg", ".png", ".webp", ".gif"},
    "document": {".pdf", ".docx", ".doc", ".txt"},
}

MAX_SIZE = 50 * 1024 * 1024  # 50MB


def _detect_type(ext: str) -> str | None:
    for ftype, exts in ALLOWED_TYPES.items():
        if ext in exts:
            return ftype
    return None


def _check_project(db: Session, project_id: int) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return project


@router.get("", response_model=list[ProjectFileResponse])
def list_files(project_id: int, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return db.query(ProjectFile).filter(ProjectFile.project_id == project_id).all()


@router.post("", response_model=ProjectFileResponse, status_code=201)
async def upload_file(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    _check_project(db, project_id)

    original_filename = file.filename or "arquivo"
    ext = os.path.splitext(original_filename)[1].lower()
    file_type = _detect_type(ext)

    if file_type is None:
        raise HTTPException(status_code=400, detail=f"Tipo de arquivo nao permitido: {ext}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (max 50MB)")

    # Nome aleatorio via UUID - previne path traversal e colisao
    stored_filename = f"{uuid.uuid4().hex}{ext}"

    # Pasta protegida: uploads/{project_id}/
    upload_path = os.path.join(settings.UPLOAD_DIR, str(project_id))
    os.makedirs(upload_path, exist_ok=True)
    full_path = os.path.join(upload_path, stored_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    file_record = ProjectFile(
        project_id=project_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_type=file_type,
        mime_type=file.content_type,
        file_size=len(content),
        file_path=os.path.relpath(full_path, settings.UPLOAD_DIR),  # caminho relativo
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    return file_record


@router.get("/{file_id}/download")
def download_file(project_id: int, file_id: int, db: Session = Depends(get_db)):
    """Retorna o arquivo apenas para o admin autenticado."""
    _check_project(db, project_id)
    file_record = db.query(ProjectFile).filter(
        ProjectFile.id == file_id,
        ProjectFile.project_id == project_id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="Arquivo nao encontrado")

    full_path = os.path.join(settings.UPLOAD_DIR, file_record.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Arquivo fisico nao encontrado")

    # attachment: forca download, nao exibe inline
    return FileResponse(
        path=full_path,
        filename=file_record.original_filename,
        media_type=file_record.mime_type or "application/octet-stream",
        content_disposition_type="attachment",
    )


@router.delete("/{file_id}", status_code=204)
def delete_file(project_id: int, file_id: int, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    file_record = db.query(ProjectFile).filter(
        ProjectFile.id == file_id,
        ProjectFile.project_id == project_id,
    ).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="Arquivo nao encontrado")

    full_path = os.path.join(settings.UPLOAD_DIR, file_record.file_path)
    if os.path.exists(full_path):
        os.remove(full_path)

    db.delete(file_record)
    db.commit()