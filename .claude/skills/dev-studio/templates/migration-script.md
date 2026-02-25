# Alembic Migration Template

## Migration: [description]

```python
"""[description]

Revision ID: [auto]
Revises: [auto]
Create Date: [auto]
"""
from alembic import op
import sqlalchemy as sa

revision = '[auto]'
down_revision = '[auto]'

def upgrade():
    op.create_table(
        '[table_name]',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    # op.add_column('[table]', sa.Column('[name]', sa.String()))
    # op.create_index('ix_[table]_[column]', '[table]', ['[column]'])

def downgrade():
    op.drop_table('[table_name]')
    # op.drop_column('[table]', '[name]')
    # op.drop_index('ix_[table]_[column]')
```