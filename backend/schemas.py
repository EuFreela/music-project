"""
Schemas Pydantic - validacao de dados de entrada/saida
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from models import ProjectStatus, ReleaseType


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str


# ---------- Artists ----------
class ArtistBase(BaseModel):
    name: str
    genre: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    links: Optional[dict] = None


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(ArtistBase):
    name: Optional[str] = None


class ProjectRef(BaseModel):
    """Projeto leve (resumo) para listar dentro de um artista."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    artist: Optional[str] = None
    genre: Optional[str] = None
    release_type: Optional[ReleaseType] = None
    release_date: Optional[datetime] = None
    status: Optional[ProjectStatus] = None
    cover_image_path: Optional[str] = None
    tracks_count: int = 0


class ArtistResponse(ArtistBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    projects: List[ProjectRef] = []


# ---------- Tracks ----------
class TrackBase(BaseModel):
    title: str
    isrc: Optional[str] = None
    duration_seconds: Optional[int] = None
    track_number: Optional[int] = None
    lyrics: Optional[str] = None
    translation: Optional[str] = None  # traducao da letra (PT-BR)
    links: Optional[dict] = None  # {lyrics_url: onde a letra foi publicada}


class TrackCreate(TrackBase):
    pass


class TrackUpdate(BaseModel):
    """Atualizacao parcial - campos ausentes nao sao alterados."""
    title: Optional[str] = None
    isrc: Optional[str] = None
    duration_seconds: Optional[int] = None
    track_number: Optional[int] = None
    lyrics: Optional[str] = None
    translation: Optional[str] = None
    links: Optional[dict] = None


class TrackResponse(TrackBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    audio_original_filename: Optional[str] = None
    audio_size: Optional[int] = None
    created_at: datetime


# ---------- Collaborators ----------
class CollaboratorBase(BaseModel):
    name: str
    role: Optional[str] = None
    contact: Optional[str] = None


class CollaboratorCreate(CollaboratorBase):
    pass


class CollaboratorResponse(CollaboratorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- Projects ----------
class ProjectBase(BaseModel):
    name: str
    artist: Optional[str] = None
    artist_id: Optional[int] = None
    genre: Optional[str] = None
    release_type: Optional[ReleaseType] = ReleaseType.album
    release_platform: Optional[str] = None
    release_date: Optional[datetime] = None
    status: Optional[ProjectStatus] = ProjectStatus.planejamento
    notes: Optional[str] = None
    cover_image_path: Optional[str] = None
    label: Optional[str] = None
    upc: Optional[str] = None
    distributed: Optional[bool] = False
    links: Optional[dict] = None
    budget: Optional[float] = 0.0
    revenue: Optional[float] = 0.0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    artist: Optional[str] = None
    artist_id: Optional[int] = None
    genre: Optional[str] = None
    release_type: Optional[ReleaseType] = None
    release_platform: Optional[str] = None
    release_date: Optional[datetime] = None
    status: Optional[ProjectStatus] = None
    notes: Optional[str] = None
    label: Optional[str] = None
    upc: Optional[str] = None
    distributed: Optional[bool] = None
    links: Optional[dict] = None
    budget: Optional[float] = None
    revenue: Optional[float] = None


class ArtistRef(BaseModel):
    """Referencia leve de artista dentro de um projeto (evita recursao)."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    image_path: Optional[str] = None


class ProjectFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    original_filename: str
    file_type: str
    file_size: int
    created_at: datetime


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    tracks: List[TrackResponse] = []
    collaborators: List[CollaboratorResponse] = []
    files: List[ProjectFileResponse] = []
    artist_ref: Optional[ArtistRef] = None
