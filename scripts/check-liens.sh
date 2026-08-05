#!/usr/bin/env bash
# Vérifie les liens internes du dist servi sous /porquerolles/ (PLAN B3).
# Ignore les liens externes (Parc, Open-Meteo, etc.) : une panne chez eux
# ne doit pas faire échouer notre CI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/site"
PORT="${PORT:-4321}"
HOST="127.0.0.1"

npm run preview -- --host "$HOST" --port "$PORT" &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT

for i in $(seq 1 30); do
  if curl -sf "http://$HOST:$PORT/porquerolles/" >/dev/null; then
    break
  fi
  sleep 0.5
done

npx --yes linkinator "http://$HOST:$PORT/porquerolles/" \
  --recurse \
  --verbosity error \
  --skip 'portcros-parcnational\.fr|open-meteo\.com|risque-prevention-incendie\.fr|gallica\.bnf\.fr|data\.gouv\.fr'
