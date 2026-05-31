#!/bin/bash

set -e

URL="https://public.osuc.dev/courses-unified.json"

# Carga credenciales desde .env.local para que wrangler no pida `wrangler login`
ENV_FILE="$(dirname "$0")/../.env.local"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# wrangler se autentica con estas variables (token + account/client id)
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-$WRANGLER_TOKEN}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-$WRANGLER_CLIENT_ID}"

if [[ -z "$CLOUDFLARE_API_TOKEN" || -z "$CLOUDFLARE_ACCOUNT_ID" ]]; then
  echo "Error: faltan credenciales en .env.local:"
  echo "  CLOUDFLARE_API_TOKEN=...   (token de wrangler)"
  echo "  CLOUDFLARE_ACCOUNT_ID=...  (account/client id)"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: 'jq' no esta instalado"
  exit 1
fi

MODE="${1:-0}"

if [[ "$MODE" == "1" ]]; then
  KV_FLAG="--remote"
elif [[ "$MODE" == "0" ]]; then
  KV_FLAG="--local"
else
  echo "Uso: $0 <0|1>  (0 = local, 1 = remote)"
  exit 1
fi

curl -sSf "$URL" -o raw.json

echo "Transformando a formato KV compatible con wrangler..."

jq '
  to_entries |
  map({
    key: ("course:" + .key),
    value: (.value | tostring)
  })
' raw.json > kv.json

echo "Listo → kv.json"

npx wrangler kv bulk put kv.json --binding=KV $KV_FLAG