# Deploy StokPro ke VPS (Docker Compose)

Panduan deploy full-stack StokPro (Postgres + FastAPI + React SPA) ke VPS pakai
Docker Compose dan Caddy sebagai reverse proxy (auto-HTTPS).

## Arsitektur

```
        Internet
           |
        [ Caddy ]  :80 / :443  (reverse proxy + TLS)
        /        \
  /api/* /health   semua route lain
  /docs            |
     |             |
 [ backend ]    [ frontend ]
  FastAPI         nginx (SPA)
  :8000           :80
     |
  [ db ] Postgres 16
```

- `caddy` satu-satunya yang nge-expose port ke publik (80/443).
- `backend`, `frontend`, `db` cuma diakses di network internal Docker.
- `backend` otomatis nunggu DB siap, jalanin `alembic upgrade head`, dan (opsional)
  seed data awal saat start.

## Prasyarat di VPS

- Docker Engine + plugin Compose v2 (`docker compose`).
  ```bash
  curl -fsSL https://get.docker.com | sh
  ```
- Port 80 (dan 443 kalau pakai domain) kebuka di firewall / security group.
- (Opsional, buat HTTPS) domain dengan A record diarahkan ke IP VPS.

## Langkah deploy

```bash
# 1. clone
git clone https://github.com/jagres0039/stokpro-app.git
cd stokpro-app

# 2. siapkan env
cp .env.prod.example .env
nano .env        # WAJIB: ganti JWT_SECRET (min 32 char) & POSTGRES_PASSWORD

# generate JWT_SECRET cepat:
#   openssl rand -hex 32

# 3. build + jalankan
docker compose -f docker-compose.prod.yml up -d --build

# 4. cek log (migrasi + seed jalan di sini)
docker compose -f docker-compose.prod.yml logs -f backend
```

Setelah `backend` log nunjukin `Application startup complete`, buka:

- `http://IP_VPS/`            -> aplikasi (frontend)
- `http://IP_VPS/health`      -> `{"status":"ok"}`
- `http://IP_VPS/docs`        -> Swagger API

Login demo (kalau `RUN_SEED=true`): **admin@stokpro.local** / **admin12345**

> Setelah seed pertama sukses, set `RUN_SEED=false` di `.env` lalu jalankan lagi
> `docker compose -f docker-compose.prod.yml up -d` biar nggak nyoba seed terus.

## Pakai domain + HTTPS

1. Arahkan A record domain (mis. `stok.domain.com`) ke IP VPS.
2. Di `.env`:
   ```
   SITE_ADDRESS=stok.domain.com
   CORS_ALLOW_ORIGINS=https://stok.domain.com
   ```
3. `docker compose -f docker-compose.prod.yml up -d`

Caddy otomatis ambil sertifikat Let's Encrypt. Pastikan port 443 kebuka.

## Operasional

```bash
# lihat status
docker compose -f docker-compose.prod.yml ps

# update versi (setelah git pull)
git pull
docker compose -f docker-compose.prod.yml up -d --build

# migrasi manual (kalau perlu)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# seed manual
docker compose -f docker-compose.prod.yml exec backend python -m app.seed

# backup database
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U stokpro stokpro > backup_$(date +%F).sql

# restore
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db \
  psql -U stokpro -d stokpro

# stop (data tetap aman di volume)
docker compose -f docker-compose.prod.yml down
```

## Catatan

- Data Postgres persist di volume `pgdata`; sertifikat TLS di `caddy_data`.
  `down` biasa nggak ngehapus volume. Jangan pakai `down -v` kecuali memang mau
  reset total.
- File `docker-compose.yml` (yang lama, cuma `db`) tetap dipakai buat dev lokal.
  Untuk produksi pakai `docker-compose.prod.yml`.
- Kalau ganti `JWT_SECRET` setelah ada user login, semua token lama jadi invalid
  (user harus login ulang) — itu normal.
