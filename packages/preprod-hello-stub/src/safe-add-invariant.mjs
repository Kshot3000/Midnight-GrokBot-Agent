/**
 * Source check for the official Compact addition-narrowing pattern.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/guides/security-best-practices
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

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkSafeAdd(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact compiler ~0.31.1 lab pin)');
  }
  if (!/export\s+ledger\s+balance:\s*Uint<64>/.test(code)) {
    failures.push('balance must be Uint<64>');
  }
  if (!/constructor\s*\(\s*\)\s*\{[^}]*balance\s*=\s*5\s*;/.test(code)) {
    failures.push('constructor must set balance = 5');
  }
  if (!/export\s+circuit\s+safeAdd\s*\(amount:\s*Uint<64>\)/.test(code)) {
    failures.push('safeAdd must take amount: Uint<64>');
  }
  if (!/const\s+amt\s*=\s*disclose\s*\(\s*amount\s*\)/.test(code)) {
    failures.push('safeAdd must disclose amount before the bound assert');
  }
  if (!/assert\s*\(\s*amt\s*<=\s*100\s*,\s*"amount too large"\s*\)/.test(code)) {
    failures.push('safeAdd must assert a lab bound before the cast');
  }
  if (!/balance\s*=\s*\(\s*balance\s*\+\s*amt\s*\)\s*as\s*Uint<64>\s*;/.test(code)) {
    failures.push('safeAdd must store (balance + amt) as Uint<64>');
  }
  if (/balance\s*=\s*balance\s*\+\s*amt\s*;/.test(code)) {
    failures.push('do not assign the widened sum back without the documented cast');
  }
  if (/wrapping|saturat/.test(code)) {
    failures.push('do not invent wrapping or saturating addition');
  }
  if (!/widens past the operand width/.test(raw)) {
    failures.push('comment must cite the official widening behavior');
  }

  return {
    ok: failures.length === 0,
    failures,
    castForm: '(balance + amt) as Uint<64>',
    labBound: 'amount too large',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabSafeAdd() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/safe-add.compact'), 'utf8');
  return checkSafeAdd(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabSafeAdd();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
