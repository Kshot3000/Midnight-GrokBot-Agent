/**
 * Source check for the language-pinned CircuitContext sample.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL = 'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkCircuitContextPin(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23');
  }
  if (!/export\s+ledger\s+message:\s*Opaque<"string">/.test(code)) {
    failures.push('message must be Opaque<"string">');
  }
  if (!/export\s+circuit\s+storeMessage\s*\(newMessage:\s*Opaque<"string">\)/.test(code)) {
    failures.push('storeMessage must take newMessage: Opaque<"string">');
  }
  if (!/message\s*=\s*disclose\s*\(\s*newMessage\s*\)/.test(code)) {
    failures.push('storeMessage must disclose newMessage before writing the ledger');
  }
  if (/privateState/.test(code) || /ledgerState/.test(code) || /newLedgerState/.test(code) || /newContext/.test(code)) {
    failures.push('do not use the stale hand-built context shape');
  }

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabCircuitContextPin() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/circuit-context-pin.compact'), 'utf8');
  return checkCircuitContextPin(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabCircuitContextPin();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
