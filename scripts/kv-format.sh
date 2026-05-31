#!/bin/bash

set -e

if [[ -z $1 ]]; then
  echo "No se paso la url"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: 'jq' no esta instalado"
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

echo "Listo → kv.jsonl"