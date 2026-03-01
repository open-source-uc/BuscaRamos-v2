#!/bin/bash

npx wrangler r2 object put ousc-public/courses-sections.ndjson --file=./data/courses-sections.ndjson --content-type="application/x-ndjson; charset=utf-8" --remote
