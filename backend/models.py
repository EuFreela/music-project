"""
Modelos ORM (SQLAlchemy) - tabelas do banco
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime,
    ForeignKey, Enum, Boolean, JSON, text
)
from sqlalchemy.orm import relationship
from database import Base
import enum


class ProjectStatus(enum.Enum):
    planejamento = "planejamento"
    producao = "producao"
    mixagem = "mixagem"
    masterizacao = "masterizacao"
    lancado = "lancado"
    pausado = "pausado"


class ReleaseType(enum.Enum):
    album = "album"
    ep = "ep"
    single = "single"


class Admin(Base):
    """Tabela do admin unico (apenas 1 registro)"""
    __tablename__ = "admin"

    id = Column(Integer, primary_key=True, default=1)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    avatar_seed = Column(String(100), nullable=True)  # avatar pré-definido (DiceBear Clay)
    avatar_path = Column(String(500), nullable=True)  # avatar enviado (imagem enviada)


class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    genre = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    links = Column(JSON, nullable=True)  # {spotify, instagram, facebook, youtube, website, ...}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="artist_ref")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    artist = Column(String(255), nullable=True)  # legado/compatibilidade
    artist_id = Column(Integer, ForeignKey("artists.id", ondelete="SET NULL"), nullable=True)
    genre = Column(String(100), nullable=True)
    release_type = Column(Enum(ReleaseType), default=ReleaseType.album)
    release_platform = Column(String(255), nullable=True)  # Spotify, YouTube, etc
    release_date = Column(DateTime, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.planejamento)
    description = Column(Text, nullable=True)  # "Sobre o album" - descricao do projeto
    notes = Column(Text, nullable=True)
    cover_image_path = Column(String(500), nullable=True)

    # Dados de distribuicao
    label = Column(String(255), nullable=True)  # gravadora
    distributor = Column(String(255), nullable=True)  # distribuidora (ONErpm, DistroKid, TuneCore, ...)
    upc = Column(String(32), nullable=True)  # codigo de catalogo
    distributed = Column(Boolean, nullable=False, default=False, server_default=text("0"))
    links = Column(JSON, nullable=True)  # {spotify, apple_music, youtube, deezer, site, ...}

    # Financas (campos simples)
    budget = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    artist_ref = relationship("Artist", back_populates="projects", foreign_keys=[artist_id])
    tracks = relationship("Track", back_populates="project", cascade="all, delete-orphan")
    collaborators = relationship("Collaborator", back_populates="project", cascade="all, delete-orphan")
    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")

    @property
    def tracks_count(self) -> int:
        return len(self.tracks) if self.tracks is not None else 0


class Track(Base):
    __tablename__ = "tracks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    isrc = Column(String(20), nullable=True)
    duration = Column(String(20), nullable=True)  # duracao em texto livre (ex.: "3:45")
    track_number = Column(Integer, nullable=True)
    lyrics = Column(Text, nullable=True)
    translation = Column(Text, nullable=True)  # traducao da letra (PT-BR)

    # Audio MP3 da faixa (arquivo protegido)
    audio_path = Column(String(500), nullable=True)  # caminho relativo em uploads/
    audio_original_filename = Column(String(255), nullable=True)
    audio_size = Column(Integer, nullable=True)
    audio_mime = Column(String(100), nullable=True)

    # Distribuicao: onde a musica foi publicada {streaming_url, spotify, youtube, ...}
    links = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tracks")


class Collaborator(Base):
    __tablename__ = "collaborators"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=True)  # Produtor, Eng. de som, etc
    contact = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="collaborators")


class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)  # UUID
    file_type = Column(String(10), nullable=False)          # audio/image/document
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, default=0)
    file_path = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="files")