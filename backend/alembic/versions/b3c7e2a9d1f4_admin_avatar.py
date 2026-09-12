"""admin ganha campos de avatar

Revision ID: b3c7e2a9d1f4
Revises: 9e7d2c4a1f83
Create Date: 2026-09-11

Adiciona admin.avatar_seed (VARCHAR 100) - seed do avatar pre-definido
(DiceBear Lorelei) e admin.avatar_path (VARCHAR 500) - caminho relativo
da imagem de avatar enviada pelo admin.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b3c7e2a9d1f4"
down_revision = "9e7d2c4a1f83"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("admin", sa.Column("avatar_seed", sa.String(length=100), nullable=True))
    op.add_column("admin", sa.Column("avatar_path", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("admin", "avatar_path")
    op.drop_column("admin", "avatar_seed")