#!/bin/bash

set -e

URL="https://public.osuc.dev/courses-unified.json"

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