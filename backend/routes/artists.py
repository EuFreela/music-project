"""
Rotas de artistas - CRUD completo + foto de perfil
"""
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Artist, Project
from schemas import ArtistCreate, ArtistUpdate, ArtistResponse
from security import get_current_admin
from config import settings
from upload_paths import artist_folder

router = APIRouter(prefix="/api/artists", tags=["artists"], dependencies=[Depends(get_current_admin)])

ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


def _load_artist(db: Session, artist_id: int) -> Artist:
    artist = (
        db.query(Artist)
        .options(selectinload(Artist.projects).selectinload(Project.tracks))
        .filter(Artist.id == artist_id)
        .first()
    )
    if not artist:
        raise HTTPException(status_code=404, detail="Artista nao encontrado")
    return artist


@router.get("", response_model=list[ArtistResponse])
def list_artists(db: Session = Depends(get_db)):
    return (
        db.query(Artist)
        .options(selectinload(Artist.projects).selectinload(Project.tracks))
        .order_by(Artist.name)
        .all()
    )


@router.post("", response_model=ArtistResponse, status_code=201)
def create_artist(data: ArtistCreate, db: Session = Depends(get_db)):
    artist = Artist(**data.model_dump())
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return _load_artist(db, artist.id)


@router.get("/{artist_id}", response_model=ArtistResponse)
def get_artist(artist_id: int, db: Session = Depends(get_db)):
    return _load_artist(db, artist_id)


@router.put("/{artist_id}", response_model=ArtistResponse)
def update_artist(artist_id: int, data: ArtistUpdate, db: Session = Depends(get_db)):
    artist = _load_artist(db, artist_id)
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(artist, field, value)
    db.commit()
    db.refresh(artist)
    return _load_artist(db, artist_id)


@router.delete("/{artist_id}", status_code=204)
def delete_artist(artist_id: int, db: Session = Depends(get_db)):
    artist = _load_artist(db, artist_id)
    # Desvincula projetos (apenas remove o vinculo, nao apaga os projetos)
    db.query(Project).filter(Project.artist_id == artist_id).update({Project.artist_id: None})
    db.delete(artist)
    db.commit()


# ---------- Foto de perfil ----------
@router.post("/{artist_id}/image", response_model=ArtistResponse)
async def upload_artist_image(
    artist_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    artist = _load_artist(db, artist_id)

    original_filename = file.filename or "foto"
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail=f"Formato de imagem nao permitido: {ext}")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Imagem muito grande (max 10MB)")

    # Remove foto anterior
    if artist.image_path:
        old_path = os.path.join(settings.UPLOAD_DIR, artist.image_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    # Pasta legivel: uploads/<artista>/foto<ext>
    stored_filename = f"foto{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, artist_folder(artist))
    os.makedirs(upload_path, exist_ok=True)
    full_path = os.path.join(upload_path, stored_filename)

    with open(full_path, "wb") as f:
        f.write(content)

    artist.image_path = os.path.relpath(full_path, settings.UPLOAD_DIR)
    db.commit()
    db.refresh(artist)
    return _load_artist(db, artist_id)


@router.get("/{artist_id}/image")
def serve_artist_image(artist_id: int, db: Session = Depends(get_db)):
    """Serve a foto (inline) apenas para admin autenticado."""
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist or not artist.image_path:
        raise HTTPException(status_code=404, detail="Imagem nao encontrada")

    full_path = os.path.join(settings.UPLOAD_DIR, artist.image_path)
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