#!/usr/bin/env node
/**
 * Honest artifact gate: refuse to pretend deploy/off-chain works without
 * real Compact outputs (contract JS + prover/verifier keys + zkir).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { HELLO_OUT, HELLO_CONTRACT, HELLO_KEYS, HELLO_ZKIR } from './paths.mjs';
import { banner, section, kv, ok, fail, brandLine, printJson } from './cli-format.mjs';

const required = [
  HELLO_CONTRACT,
  path.join(HELLO_KEYS, 'increment.prover'),
  path.join(HELLO_KEYS, 'increment.verifier'),
  path.join(HELLO_ZKIR, 'increment.zkir'),
];

/** @returns {{ ok: true, out: string, sizes: Record<string, number> } | { ok: false, missing: string[] }} */
export function inspectHelloArtifacts() {
  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length) return { ok: false, missing };
  const sizes = Object.fromEntries(
    required.map((p) => [path.relative(HELLO_OUT, p), fs.statSync(p).size]),
  );
  return { ok: true, out: HELLO_OUT, sizes };
}

/** Side-effect gate used by other scripts — quiet success, loud failure. */
export function requireHelloArtifactsOrExit() {
  const r = inspectHelloArtifacts();
  if (r.ok) return r;
  fail('MISSING compiled hello artifacts (not a fake path)');
  for (const p of r.missing) console.error('  -', p);
  console.error('\nFix: from repo root (Compact CLI +0.31.1):');
  console.error('  export PATH="$HOME/.local/bin:$PATH"');
  console.error('  npm run compact:hello');
  process.exit(1);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  banner('preprod-hello-stub · check artifacts', {
    claim: 'Compiled Compact outputs required — not a deploy',
  });
  const r = inspectHelloArtifacts();
  if (!r.ok) {
    fail('MISSING compiled hello artifacts (not a fake path)');
    section('Missing');
    for (const p of r.missing) console.error('  -', p);
    section('Fix');
    console.error('  export PATH="$HOME/.local/bin:$PATH"');
    console.error('  npm run compact:hello   # Compact CLI +0.31.1');
    brandLine();
    process.exit(1);
  }
  ok(`artifacts present under ${r.out}`);
  section('Sizes (bytes)');
  for (const [rel, size] of Object.entries(r.sizes)) kv(rel, size);
  printJson({ ok: true, out: r.out, sizes: r.sizes, claim: 'compiled yes — NOT on-chain' });
  brandLine();
}
