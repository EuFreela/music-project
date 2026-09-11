"""
Helpers de nomes legiveis por humanos para a pasta uploads.

Padrao do projeto:
    - tudo em minusculas
    - sem acentos
    - espacos (e caracteres especiais) preenchidos por "_" (underline)

Exemplo:
    "Chapter 1: Listen To Daddy - Album by Bunny Land"
        -> "chapter_1_listen_to_daddy_album_by_bunny_land"
"""
import re
import unicodedata


def slugify(value: str | None, fallback: str = "sem_nome") -> str:
    """Converte qualquer texto em um nome seguro e legivel (slug).

    - remove acentos (NFD)
    - tudo minusculo
    - qualquer sequencia fora de [a-z0-9] vira "_"
    - nunca retorna string vazia (usa fallback)
    """
    if not value:
        return fallback

    text = unicodedata.normalize("NFKD", str(value))
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    text = text.strip("_")
    return text or fallback