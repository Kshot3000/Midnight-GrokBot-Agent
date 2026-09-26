#!/usr/bin/env node
/**
 * Honest artifact gate for agent-escrow managed Compact outputs.
 * 12 impure circuits with prover/verifier + zkir required.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ESCROW_OUT,
  ESCROW_CONTRACT,
  ESCROW_KEYS,
  ESCROW_ZKIR,
  ESCROW_CIRCUITS,
} from './paths.mjs';
import { banner, section, kv, ok, fail, brandLine, printJson } from './cli-format.mjs';

function requiredPaths() {
  const files = [ESCROW_CONTRACT];
  for (const c of ESCROW_CIRCUITS) {
    files.push(path.join(ESCROW_KEYS, `${c}.prover`));
    files.push(path.join(ESCROW_KEYS, `${c}.verifier`));
    files.push(path.join(ESCROW_ZKIR, `${c}.zkir`));
  }
  return files;
}

/** @returns {{ ok: true, out: string, circuitCount: number, sizes: Record<string, number> } | { ok: false, missing: string[] }} */
export function inspectEscrowArtifacts() {
  const required = requiredPaths();
  const missing = required.filter((p) => !fs.existsSync(p));
  if (missing.length) return { ok: false, missing };
  const sizes = Object.fromEntries(
    required.map((p) => [path.relative(ESCROW_OUT, p), fs.statSync(p).size]),
  );
  return {
    ok: true,
    out: ESCROW_OUT,
    circuitCount: ESCROW_CIRCUITS.length,
    circuits: [...ESCROW_CIRCUITS],
    sizes,
  };
}

export function requireEscrowArtifactsOrExit() {
  const r = inspectEscrowArtifacts();
  if (r.ok) return r;
  fail('MISSING compiled agent-escrow artifacts (not a fake path)');
  for (const p of r.missing.slice(0, 12)) console.error('  -', p);
  if (r.missing.length > 12) console.error(`  … +${r.missing.length - 12} more`);
  console.error('\nFix: from repo root (Compact CLI +0.31.1):');
  console.error('  export PATH="$HOME/.local/bin:$PATH"');
  console.error('  npm run compact:escrow');
  process.exit(1);
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  banner('preprod-hello-stub · check escrow artifacts', {
    claim: 'Compiled Compact outputs required — not a deploy',
  });
  const r = inspectEscrowArtifacts();
  if (!r.ok) {
    fail('MISSING compiled agent-escrow artifacts (not a fake path)');
    section('Missing');
    for (const p of r.missing) console.error('  -', p);
    section('Fix');
    console.error('  export PATH="$HOME/.local/bin:$PATH"');
    console.error('  npm run compact:escrow   # Compact CLI +0.31.1');
    brandLine();
    process.exit(1);
  }
  ok(`artifacts present under ${r.out} (${r.circuitCount} circuits)`);
  section('Sample sizes (bytes)');
  for (const [rel, size] of Object.entries(r.sizes).slice(0, 8)) kv(rel, size);
  kv('…', `${Object.keys(r.sizes).length} files total`);
  printJson({
    ok: true,
    out: r.out,
    circuitCount: r.circuitCount,
    circuits: r.circuits,
    claim: 'compiled yes — NOT on-chain',
  });
  brandLine();
}
