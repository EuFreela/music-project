"""duracao da faixa vira texto livre (ex.: 3:45)

Revision ID: c4d8f9a10b2e
Revises: 804cb7ff7022
Create Date: 2026-09-11

Realiza:
- adiciona tracks.duration (VARCHAR 20)
- copia duration_seconds numericos como "M:SS"
- remove tracks.duration_seconds
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c4d8f9a10b2e"
down_revision = "804cb7ff7022"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tracks", sa.Column("duration", sa.String(length=20), nullable=True))

    # Converte segundos existentes para texto legivel "M:SS"
    op.execute(
        """
        UPDATE tracks
        SET duration = CONCAT(
                FLOOR(COALESCE(duration_seconds, 0) / 60),
                ':',
                LPAD(FLOOR(COALESCE(duration_seconds, 0) % 60), 2, '0')
            )
        WHERE duration_seconds IS NOT NULL
        """
    )

    op.drop_column("tracks", "duration_seconds")


def downgrade() -> None:
    op.add_column("tracks", sa.Column("duration_seconds", sa.Integer(), nullable=True))

    # Converte textos "M:SS" de volta para segundos (quando possivel)
    op.execute(
        """
        UPDATE tracks
        SET duration_seconds =
            CAST(SUBSTRING_INDEX(duration, ':', 1) AS UNSIGNED) * 60
            + CAST(SUBSTRING_INDEX(duration, ':', -1) AS UNSIGNED)
        WHERE duration IS NOT NULL
          AND duration REGEXP '^[0-9]+:[0-9]{1,2}$'
        """
    )

    op.drop_column("tracks", "duration")