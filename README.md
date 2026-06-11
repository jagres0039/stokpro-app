# StokPro — Sistem Manajemen Gudang

Fullstack inventory / warehouse management untuk PT, CV & UMKM.
Multi-cabang, multi-gudang. Palet: **Teal + Slate**.

## Stack
- **Backend:** FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, JWT auth, slowapi rate-limit
- **Frontend:** React + Vite + TypeScript
- **Tooling:** uv, ruff, mypy, pytest, GitHub Actions CI

## Struktur
```
stokpro/
├─ backend/        FastAPI app (app/), Alembic, tests
├─ frontend/       React + Vite + TS
├─ docs/           design-mockup.html (referensi UI)
├─ .github/        CI workflow
└─ docker-compose.yml  Postgres lokal
```

## Quickstart

### 1. Database
```bash
docker compose up -d db
```

### 2. Backend
```bash
cd backend
cp ../.env.example .env   # isi JWT_SECRET (min 32 char)
uv sync
uv run alembic revision --autogenerate -m "init"
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```
API: http://localhost:8000  ·  Docs: http://localhost:8000/docs

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
App: http://localhost:5173

## Cek kualitas
```bash
cd backend
uv run ruff check .
uv run mypy app
uv run pytest
```
