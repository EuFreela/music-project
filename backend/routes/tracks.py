"""
Rotas de faixas/musicas - CRUD por projeto
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Track
from schemas import TrackCreate, TrackResponse
from security import get_current_admin

router = APIRouter(prefix="/api/projects/{project_id}/tracks", tags=["tracks"], dependencies=[Depends(get_current_admin)])


def _check_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return project


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
def update_track(project_id: int, track_id: int, data: TrackCreate, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id, Track.project_id == project_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Faixa nao encontrada")
    for field, value in data.model_dump().items():
        setattr(track, field, value)
    db.commit()
    db.refresh(track)
    return track


@router.delete("/{track_id}", status_code=204)
def delete_track(project_id: int, track_id: int, db: Session = Depends(get_db)):
    track = db.query(Track).filter(Track.id == track_id, Track.project_id == project_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Faixa nao encontrada")
    db.delete(track)
    db.commit()