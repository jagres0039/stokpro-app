#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] menunggu database siap..."
python - <<'PY'
import os, sys, time
import psycopg

url = os.environ.get("DATABASE_URL", "")
dsn = url.replace("postgresql+psycopg://", "postgresql://")
last = ""
for i in range(60):
    try:
        with psycopg.connect(dsn, connect_timeout=3):
            print("[entrypoint] database OK")
            sys.exit(0)
    except Exception as e:  # noqa: BLE001
        last = str(e)
        time.sleep(2)
print(f"[entrypoint] database tidak siap: {last}", file=sys.stderr)
sys.exit(1)
PY

echo "[entrypoint] menjalankan migrasi (alembic upgrade head)..."
alembic upgrade head

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "[entrypoint] seeding data awal..."
  python -m app.seed || echo "[entrypoint] seed dilewati (kemungkinan data sudah ada)."
fi

echo "[entrypoint] start: $*"
exec "$@"
