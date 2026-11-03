#!/usr/bin/env bash
# Build a clean client handoff zip: source + local-run picture guide.
# Excludes node_modules, secrets, uploads, and build artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
STAMP="$(date -u +%Y%m%d)"
OUT="$DIST/gozo-home-source-${STAMP}.zip"
LATEST="$DIST/gozo-home-source.zip"

mkdir -p "$DIST"
rm -f "$OUT" "$LATEST"

# Paths relative to repo root included in the zip
INCLUDE=(
  GOZO_HOME_LOCAL_RUN_GUIDE.md
  START_HERE.md
  CLIENT_LOCAL_RUN.md
  ADMIN_PANEL.md
  MIGRATION_MONGO_VITE_NODE22.md
  docs/client-guide
  scripts/make-client-source-zip.sh
  original_partyBox_new_api
  original_HoneyEcommerce_new_ui
  Honey_admin_UI
)

EXCLUDE=(
  "*/node_modules/*"
  "*/.git/*"
  "*/.env"
  "*/.env.local"
  "*/cloud/*"
  "*/build/*"
  "*/dist/*"
  "*/.mongo-data/*"
  "*.log"
  "*/build.zip"
  "*/.DS_Store"
)

EXCLUDE_ARGS=()
for pattern in "${EXCLUDE[@]}"; do
  EXCLUDE_ARGS+=(-x "$pattern")
done

cd "$ROOT"
zip -r "$OUT" "${INCLUDE[@]}" "${EXCLUDE_ARGS[@]}"

# Stable name for delivery docs
cp -f "$OUT" "$LATEST"

echo "Created:"
echo "  $OUT"
echo "  $LATEST  (same contents)"
ls -lh "$OUT"
