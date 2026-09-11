"""
Rotas de projetos - CRUD completo
"""
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Project, ProjectStatus
from schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from security import get_current_admin
from config import settings
from upload_paths import project_folder

router = APIRouter(prefix="/api/projects", tags=["projects"], dependencies=[Depends(get_current_admin)])

ALLOWED_COVER_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_COVER_SIZE = 10 * 1024 * 1024  # 10MB


def _load_project(db: Session, project_id: int) -> Project:
    """Busca projeto com relacionamentos."""
    project = db.query(Project).options(
        selectinload(Project.artist_ref),
        selectinload(Project.tracks),
        selectinload(Project.collaborators),
        selectinload(Project.files),
    ).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    status_filter: ProjectStatus | None = None,
    genre: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    """Lista projetos com filtros opcionais."""
    query = db.query(Project).options(
        selectinload(Project.artist_ref),
        selectinload(Project.tracks),
        selectinload(Project.collaborators),
        selectinload(Project.files),
    )

    if status_filter:
        query = query.filter(Project.status == status_filter)
    if genre:
        query = query.filter(Project.genre.ilike(f"%{genre}%"))
    if search:
        query = query.filter(
            (Project.name.ilike(f"%{search}%")) |
            (Project.artist.ilike(f"%{search}%")) |
            (Project.genre.ilike(f"%{search}%"))
        )

    return query.order_by(Project.created_at.desc()).all()


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return _load_project(db, project.id)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return _load_project(db, project_id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectUpdate, db: Session = Depends(get_db)):
    project = _load_project(db, project_id)

    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return _load_project(db, project_id)


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    db.delete(project)
    db.commit()


# ---------- Capa ----------
@router.post("/{project_id}/cover", response_model=ProjectResponse)
async def upload_cover(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Envia/atualiza a capa do projeto (imagem)."""
    project = _load_project(db, project_id)

    original_filename = file.filename or "capa"
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_COVER_EXT:
        raise HTTPException(status_code=400, detail=f"Formato de imagem nao permitido: {ext}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")
    if len(content) > MAX_COVER_SIZE:
        raise HTTPException(status_code=400, detail="Imagem muito grande (max 10MB)")

    # Remove capa anterior
    if project.cover_image_path:
        old_path = os.path.join(settings.UPLOAD_DIR, project.cover_image_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    # Pasta legivel: uploads/<artista>/<album>/
    stored_filename = f"capa{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, project_folder(project))
    os.makedirs(upload_path, exist_ok=True)
    full_path = os.path.join(upload_path, stored_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    project.cover_image_path = os.path.relpath(full_path, settings.UPLOAD_DIR)
    db.commit()
    db.refresh(project)
    return _load_project(db, project_id)


@router.get("/{project_id}/cover")
def serve_cover(project_id: int, db: Session = Depends(get_db)):
    """Serve a capa (inline) apenas para admin autenticado."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.cover_image_path:
        raise HTTPException(status_code=404, detail="Capa nao encontrada")

    full_path = os.path.join(settings.UPLOAD_DIR, project.cover_image_path)
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