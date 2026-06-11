# StokPro Backend

FastAPI + SQLAlchemy + Alembic.

```bash
uv sync
cp ../.env.example .env   # set JWT_SECRET (>=32 chars)
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```
