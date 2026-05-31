#!/bin/bash

set -e

if [[ -z $1 ]]; then
  echo "Uso: $0 <url> <0|1>"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: 'jq' no esta instalado"
  exit 1
fi

MODE="${2:-0}"

if [[ "$MODE" == "1" ]]; then
  KV_FLAG="--remote"
elif [[ "$MODE" == "0" ]]; then
  KV_FLAG="--local"
else
  echo "El segundo argumento debe ser 0 (local) o 1 (remote)"
  exit 1
fi

curl -sSf "$1" -o raw.json

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