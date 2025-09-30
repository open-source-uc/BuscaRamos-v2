#!/bin/bash

wrangler r2 object put ousc-public/courses-descriptions.json --file=./data/courses-descriptions.json --content-t
ype="application/json; charset=utf-8" --remote

wrangler r2 object put ousc-public/courses-sections.ndjson   --file=./data/courses-sections.ndjson   --content-t
ype="application/x-ndjson; charset=utf-8"   --remote