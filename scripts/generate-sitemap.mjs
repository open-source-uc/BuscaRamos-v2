#!/usr/bin/env node
// Generates src/app/sitemap-sigles.json from the public NDJSON catalog.
// Run with: pnpm sitemap

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/app/sitemap-sigles.json");
const NDJSON_URL = "https://public.osuc.dev/courses-score.ndjson";

console.log("Fetching catalog…");
const res = await fetch(NDJSON_URL);
if (!res.ok) throw new Error(`HTTP ${res.status}`);

const text = await res.text();
const sigles = [];

for (const line of text.split("\n")) {
  if (!line.trim()) continue;
  try {
    const { sigle, likes, dislikes, superlikes } = JSON.parse(line);
    const hasReviews = Number(likes) > 0 || Number(dislikes) > 0 || Number(superlikes) > 0;

    if (sigle && hasReviews) sigles.push(sigle);
  } catch {
    // skip malformed lines
  }
}

writeFileSync(OUT, JSON.stringify(sigles), "utf-8");
console.log(`✓ ${sigles.length} sigles → src/app/sitemap-sigles.json`);
