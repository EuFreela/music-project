"""projeto ganha campo distribuidora

Revision ID: 9e7d2c4a1f83
Revises: c4d8f9a10b2e
Create Date: 2026-09-11

Adiciona projects.distributor (VARCHAR 255) - nome da distribuidora
(ex.: ONErpm, DistroKid, TuneCore).
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "9e7d2c4a1f83"
down_revision = "c4d8f9a10b2e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("distributor", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("projects", "distributor")