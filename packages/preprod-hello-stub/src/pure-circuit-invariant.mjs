/**
 * Source check for a pure Compact circuit that only reads its inputs.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 * Official: https://docs.midnight.network/compact/reference/compact-reference
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/compact-reference';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkPureCircuit(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact compiler ~0.31.1 lab pin)');
  }
  if (!/export\s+pure\s+circuit\s+pureAdd\s*\(\s*a:\s*Uint<64>\s*,\s*b:\s*Uint<64>\s*\)\s*:\s*Uint<64>/.test(code)) {
    failures.push('must export pure circuit pureAdd(a: Uint<64>, b: Uint<64>): Uint<64>');
  }
  if (!/const\s+x\s*=\s*disclose\s*\(\s*a\s*\)/.test(code)) {
    failures.push('must disclose a');
  }
  if (!/const\s+y\s*=\s*disclose\s*\(\s*b\s*\)/.test(code)) {
    failures.push('must disclose b');
  }
  if (!/\(\s*x\s*\+\s*y\s*\)\s*as\s*Uint<64>/.test(code)) {
    failures.push('must return (x + y) as Uint<64>');
  }
  // pure circuits must not touch ledger or witnesses
  if (/ledger|witness|assert\s*\(|constructor/.test(code)) {
    failures.push('pure circuit must not reference ledger, witnesses, assert, or constructor');
  }
  if (/contract\s+\w+\s*\{/.test(code)) {
    failures.push('lab sample must not declare a contract type interface');
  }
  if (!/pure: computes outputs from inputs without ledger or witnesses/.test(raw)) {
    failures.push('comment must cite the official pure definition');
  }

  return {
    ok: failures.length === 0,
    failures,
    pureForm: 'export pure circuit pureAdd',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabPureCircuit() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/pure-circuit.compact'), 'utf8');
  return checkPureCircuit(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabPureCircuit();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
