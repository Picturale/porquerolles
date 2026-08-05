#!/usr/bin/env bash
# Vérifie que chaque page /carte/* fait moins de 50 ko (DECISIONS §11 / PLAN B3).
set -euo pipefail
DIST="${1:-site/dist}"
fail=0
shopt -s nullglob
pages=("$DIST"/carte/*/index.html)
if [ ${#pages[@]} -eq 0 ]; then
  echo "aucune page carte dans $DIST" >&2
  exit 1
fi
for f in "${pages[@]}"; do
  size=$(wc -c < "$f")
  echo "$f : ${size} octets"
  if [ "$size" -ge 51200 ]; then
    echo "BUDGET CARTE DÉPASSÉ : $f ≥ 50 ko" >&2
    fail=1
  fi
done
exit "$fail"
