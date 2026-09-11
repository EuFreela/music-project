"""
Convencao da pasta uploads - legivel por humanos.

uploads/
  <artista>/
    <album>/            (~projeto)
      capa.<ext>
      01_<musica>.<ext>
      <arquivos_originais>

Tudo minusculo, espacos viram "_". Ex.:
  uploads/bunny_land/chapter_1_listen_to_daddy_album_by_bunny_land/
      capa.jpg
      04_the_gateway_to_bunny_land.mp3
"""
import os

from slug import slugify


def project_folder(project) -> str:
    """Caminho relativo (a partir de uploads/) da pasta do album do projeto.

    Prioridade do nome do artista:
      1. artist_ref.name (artista cadastrado no sistema)
      2. artist (texto livre legado do projeto)
      3. "sem_artista"
    """
    artist_name = None
    if getattr(project, "artist_ref", None):
        artist_name = project.artist_ref.name
    elif getattr(project, "artist", None):
        artist_name = project.artist

    artist_slug = slugify(artist_name, "sem_artista")
    project_slug = slugify(project.name, "projeto")
    return os.path.join(artist_slug, project_slug)


def artist_folder(artist) -> str:
    """Caminho relativo (a partir de uploads/) da pasta do artista."""
    return slugify(artist.name, "artista")