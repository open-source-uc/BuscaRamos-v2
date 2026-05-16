#!/usr/bin/env bash
set -euo pipefail

DB_NAME="v2-ramos"
DATE=$(date +%Y-%m-%d)
OUTPUT=".backup-${DATE}"

echo "Exportando backup de D1 remota '${DB_NAME}'..."
pnpm wrangler d1 export "${DB_NAME}" --remote --output "${OUTPUT}"
echo "Backup guardado en: ${OUTPUT}"
