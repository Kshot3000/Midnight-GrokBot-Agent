/**
 * Human-readable CLI banners for Preprod stub scripts.
 * JSON reports stay available; banners make exit reasons scannable.
 */
import { BRAND } from './preprod-config.mjs';

const WIDTH = 64;

export function hr(char = '─') {
  return char.repeat(WIDTH);
}

export function banner(title, { claim } = {}) {
  const lines = [
    hr('═'),
    `  ${title}`,
    claim ? `  ${claim}` : null,
    hr('═'),
  ].filter(Boolean);
  console.log(lines.join('\n'));
}

export function section(label) {
  console.log(`\n▸ ${label}`);
}

export function kv(key, value) {
  const k = String(key).padEnd(18);
  console.log(`  ${k} ${value}`);
}

export function note(msg) {
  console.log(`  · ${msg}`);
}

export function warn(msg) {
  console.error(`  ! ${msg}`);
}

export function fail(msg) {
  console.error(`  ✗ ${msg}`);
}

export function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

export function brandLine() {
  console.log(`\n  Brand · donate ${BRAND.donate}`);
  console.log(`         ${BRAND.x} · ${BRAND.nightdream}`);
}

export function printJson(obj) {
  console.log('\n' + JSON.stringify(obj, null, 2));
}

/** Exit-code legend shared by deploy / wallet gates. */
export const EXIT_CODES = Object.freeze({
  0: 'OK (advisory warnings may still print)',
  1: 'Unexpected / artifact / runtime failure',
  2: 'Missing or invalid wallet credentials',
  3: 'Proof-server unhealthy (submit refused)',
  4: 'Preprod indexer/node probe failed',
  5: 'Credentials + infra OK; ALLOW_SUBMIT not set (honest stop)',
  6: 'ALLOW_SUBMIT set but funded-wallet deploy harness not enabled (tDUST pending)',
});

export function printExitLegend(codes = [2, 3, 4, 5, 6]) {
  section('Exit codes');
  for (const c of codes) {
    kv(`exit ${c}`, EXIT_CODES[c] || '(unlisted)');
  }
}
