"""
Rotas de faixas/musicas - CRUD por projeto + audio MP3 protegido
"""
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Project, Track
from schemas import TrackCreate, TrackUpdate, TrackResponse
from security import get_current_admin
from config import settings
from upload_paths import project_folder, slugify

router = APIRouter(prefix="/api/projects/{project_id}/tracks", tags=["tracks"], dependencies=[Depends(get_current_admin)])

AUDIO_EXTS = {".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"}


def _check_project(db: Session, project_id: int):
    project = (
        db.query(Project)
        .options(selectinload(Project.artist_ref))
        .filter(Project.id == project_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return project


def _get_track(db: Session, project_id: int, track_id: int) -> Track:
    track = db.query(Track).filter(Track.id == track_id, Track.project_id == project_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Faixa nao encontrada")
    return track


def _remove_audio_file(track: Track):
    """Apaga o arquivo de audio fisico da faixa (se existir)."""
    if track.audio_path:
        full_path = os.path.join(settings.UPLOAD_DIR, track.audio_path)
        if os.path.exists(full_path):
            try:
                os.remove(full_path)
            except OSError:
                pass
        track.audio_path = None
        track.audio_original_filename = None
        track.audio_size = None
        track.audio_mime = None


@router.get("", response_model=list[TrackResponse])
def list_tracks(project_id: int, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return db.query(Track).filter(Track.project_id == project_id).order_by(Track.track_number).all()


@router.post("", response_model=TrackResponse, status_code=201)
def create_track(project_id: int, data: TrackCreate, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    track = Track(project_id=project_id, **data.model_dump())
    db.add(track)
    db.commit()
    db.refresh(track)
    return track


@router.put("/{track_id}", response_model=TrackResponse)
def update_track(project_id: int, track_id: int, data: TrackUpdate, db: Session = Depends(get_db)):
    track = _get_track(db, project_id, track_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(track, field, value)
    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=204)
def delete_track(project_id: int, track_id: int, db: Session = Depends(get_db)):
    track = _get_track(db, project_id, track_id)
    _remove_audio_file(track)
    db.delete(track)
    db.commit()


# ---------- Audio MP3 da faixa (protegido) ----------

@router.post("/{track_id}/audio", response_model=TrackResponse, status_code=201)
async def upload_track_audio(project_id: int, track_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload do MP3 da faixa. Nome via UUID (anti path-traversal).

    Sistema local de organizacao: SEM limite de tamanho. Apenas valida
    extensao e conteudo nao-vazio.
    """
    track = _get_track(db, project_id, track_id)
    project = _check_project(db, project_id)

    original_filename = file.filename or "audio"
    ext = os.path.splitext(original_filename)[1].lower()
    if ext not in AUDIO_EXTS:
        raise HTTPException(status_code=400, detail=f"Formato nao permitido: {ext} (use MP3, WAV, FLAC, AAC, OGG ou M4A)")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    # Pasta legivel: uploads/<artista>/<album>/
    # Nome legivel: <numero_da_faixa>_<titulo>.<ext> (ex.: 04_the_gateway_to_bunny_land.mp3)
    rel_folder = project_folder(project)
    numero = f"{track.track_number:02d}_" if track.track_number is not None else ""
    stored_filename = f"{numero}{slugify(track.title, 'faixa')}{ext}"

    _remove_audio_file(track)  # substitui audio anterior

    full_path = os.path.join(settings.UPLOAD_DIR, rel_folder, stored_filename)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "wb") as f:
        f.write(content)

    track.audio_path = os.path.join(rel_folder, stored_filename)
    track.audio_original_filename = original_filename
    track.audio_size = len(content)
    track.audio_mime = file.content_type or "audio/mpeg"

    db.commit()
    db.refresh(track)
    return track


@router.get("/{track_id}/audio")
def stream_track_audio(project_id: int, track_id: int, db: Session = Depends(get_db)):
    """Playback protegido do MP3 da faixa (inline, apenas admin autenticado)."""
    track = _get_track(db, project_id, track_id)
    if not track.audio_path:
        raise HTTPException(status_code=404, detail="Faixa sem audio")

    full_path = os.path.join(settings.UPLOAD_DIR, track.audio_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Arquivo fisico nao encontrado")

    return FileResponse(
        path=full_path,
        filename=track.audio_original_filename or "audio.mp3",
        media_type=track.audio_mime or "audio/mpeg",
        content_disposition_type="inline",
    )


@router.delete("/{track_id}/audio", response_model=TrackResponse)
def delete_track_audio(project_id: int, track_id: int, db: Session = Depends(get_db)):
    track = _get_track(db, project_id, track_id)
    _remove_audio_file(track)
    db.commit()
    db.refresh(track)
    return track