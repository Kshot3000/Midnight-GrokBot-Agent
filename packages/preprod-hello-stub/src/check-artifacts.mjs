#!/usr/bin/env node
/**
 * Honest artifact gate: refuse to pretend deploy/off-chain works without
 * real Compact outputs (contract JS + prover/verifier keys + zkir).
 */
import fs from 'node:fs';
import path from 'node:path';
import { HELLO_OUT, HELLO_CONTRACT, HELLO_KEYS, HELLO_ZKIR } from './paths.mjs';

const required = [
  HELLO_CONTRACT,
  path.join(HELLO_KEYS, 'increment.prover'),
  path.join(HELLO_KEYS, 'increment.verifier'),
  path.join(HELLO_ZKIR, 'increment.zkir'),
];

const missing = required.filter((p) => !fs.existsSync(p));
if (missing.length) {
  console.error('MISSING compiled hello artifacts (not a fake path):');
  for (const p of missing) console.error('  -', p);
  console.error('\nFix: from repo root (Compact CLI +0.31.1):');
  console.error('  export PATH="$HOME/.local/bin:$PATH"');
  console.error('  npm run compact:hello');
  process.exit(1);
}

const sizes = Object.fromEntries(
  required.map((p) => [path.relative(HELLO_OUT, p), fs.statSync(p).size]),
);
console.log(JSON.stringify({ ok: true, out: HELLO_OUT, sizes }, null, 2));
