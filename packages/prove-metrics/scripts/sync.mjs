#!/usr/bin/env node
/**
 * Copy canonical prove-metrics into Hello + Escrow Studios.
 * Pages / python http.server cannot resolve packages/prove-metrics from app roots.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');
const repoRoot = join(pkgRoot, '..', '..');
const src = join(pkgRoot, 'src', 'index.mjs');

const targets = [
  join(repoRoot, 'apps', 'hello-studio', 'prove-metrics.mjs'),
  join(repoRoot, 'apps', 'agent-escrow-stub', 'prove-metrics.mjs'),
];

const banner =
  '/* SYNCED from packages/prove-metrics/src/index.mjs — do not edit by hand; run npm run sync:prove-metrics */\n';

const body = readFileSync(src, 'utf8');
for (const dest of targets) {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, banner + body, 'utf8');
  console.log(`synced → ${dest.replace(repoRoot + '/', '')}`);
}
console.log('prove-metrics sync ok — LOCAL ≠ on-chain helpers shared by hello+escrow');
