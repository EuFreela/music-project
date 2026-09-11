"""
Rotas de colaboradores - CRUD por projeto
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Collaborator
from schemas import CollaboratorCreate, CollaboratorResponse
from security import get_current_admin

router = APIRouter(prefix="/api/projects/{project_id}/collaborators", tags=["collaborators"], dependencies=[Depends(get_current_admin)])


def _check_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto nao encontrado")
    return project


@router.get("", response_model=list[CollaboratorResponse])
def list_collaborators(project_id: int, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    return db.query(Collaborator).filter(Collaborator.project_id == project_id).all()


@router.post("", response_model=CollaboratorResponse, status_code=201)
def create_collaborator(project_id: int, data: CollaboratorCreate, db: Session = Depends(get_db)):
    _check_project(db, project_id)
    collaborator = Collaborator(project_id=project_id, **data.model_dump())
    db.add(collaborator)
    db.commit()
    db.refresh(collaborator)
    return collaborator


@router.put("/{collaborator_id}", response_model=CollaboratorResponse)
def update_collaborator(project_id: int, collaborator_id: int, data: CollaboratorCreate, db: Session = Depends(get_db)):
    collaborator = db.query(Collaborator).filter(
        Collaborator.id == collaborator_id,
        Collaborator.project_id == project_id,
    ).first()
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador nao encontrado")
    for field, value in data.model_dump().items():
        setattr(collaborator, field, value)
    db.commit()
    db.refresh(collaborator)
    return collaborator


@router.delete("/{collaborator_id}", status_code=204)
def delete_collaborator(project_id: int, collaborator_id: int, db: Session = Depends(get_db)):
    collaborator = db.query(Collaborator).filter(
        Collaborator.id == collaborator_id,
        Collaborator.project_id == project_id,
    ).first()
    if not collaborator:
        raise HTTPException(status_code=404, detail="Colaborador nao encontrado")
    db.delete(collaborator)
    db.commit()