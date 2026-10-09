/**
 * Source check for the official calculator division witness.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/examples/contracts/calculator
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
export const OFFICIAL = 'https://docs.midnight.network/examples/contracts/calculator';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkDivideWitness(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+0\.23\s*;/.test(code)) {
    failures.push('language pin must be pragma language_version 0.23 (calculator sample)');
  }
  if (!/export\s+ledger\s+result:\s*Uint<16>/.test(code)) {
    failures.push('result must be Uint<16>');
  }
  if (!/witness\s+divMod\s*\(\s*num1:\s*Uint<16>\s*,\s*num2:\s*Uint<16>\s*\)\s*:\s*\[\s*Uint<16>\s*,\s*Uint<16>\s*\]\s*;/.test(code)) {
    failures.push('divMod must be a witness returning [Uint<16>, Uint<16>]');
  }
  if (!/export\s+circuit\s+divide\s*\(\s*num1:\s*Uint<16>\s*,\s*num2:\s*Uint<16>\s*\)\s*:\s*Uint<16>/.test(code)) {
    failures.push('divide must match the calculator signature');
  }
  if (!/const\s+\[\s*quo\s*,\s*rem\s*\]\s*=\s*divMod\s*\(\s*num1\s*,\s*num2\s*\)\s*;/.test(code)) {
    failures.push('divide must bind the divMod witness');
  }
  if (!/assert\s*\(\s*rem\s*<\s*num2\s*&&\s*quo\s*\*\s*num2\s*\+\s*rem\s*==\s*num1\s*,\s*"incorrect division"\s*\)/.test(code)) {
    failures.push('divide must assert the official incorrect-division check');
  }
  if (!/result\s*=\s*disclose\s*\(\s*quo\s*\)\s*;/.test(code)) {
    failures.push('public ledger write must disclose the quotient');
  }
  if (/divMod\s*\([^)]*\)\s*\{/.test(code)) {
    failures.push('do not implement divMod in Compact; the official page leaves it a witness');
  }

  return {
    ok: failures.length === 0,
    failures,
    assertMessage: 'incorrect division',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabDivideWitness() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/divide-witness.compact'), 'utf8');
  return checkDivideWitness(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabDivideWitness();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
