#!/usr/bin/env bash
set -euo pipefail

# rclone remote name configured for Cloudflare R2 (e.g. "r2" in ~/.config/rclone/rclone.conf)
RCLONE_REMOTE="${RCLONE_REMOTE:-osuc}"
BUCKET="v2-ramos"
DATE=$(date +%Y-%m-%d)
OUTPUT=".backup-r2-${DATE}.zip"

TMPDIR=$(mktemp -d)
trap 'rm -rf "${TMPDIR}"' EXIT

echo "Descargando reviews desde R2 '${BUCKET}/reviews'..."
rclone copy "${RCLONE_REMOTE}:${BUCKET}/reviews" "${TMPDIR}/reviews" \
  --progress \
  --transfers 8

echo "Comprimiendo..."
(cd "${TMPDIR}" && zip -r "$(pwd -P)/${OUTPUT}" reviews > /dev/null)
mv "${TMPDIR}/${OUTPUT}" .

echo "Backup guardado en: ${OUTPUT}"
