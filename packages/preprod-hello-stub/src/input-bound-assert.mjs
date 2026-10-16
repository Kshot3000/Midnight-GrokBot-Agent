/**
 * Checker for the input-bound assert Compact sample.
 * Verifies the modern assert(cond, "msg") form and a documented bound.
 * Does not compile Compact, does not call a proof server, does not invent APIs.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 * Official docs: https://docs.midnight.network/
 * Cites midnightntwrk/midnight-docs#1487.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sample = resolve(here, '../../../contracts/hello-midnight/input-bound-assert.compact');

export function checkInputBoundAssert(source = readFileSync(sample, 'utf8')) {
  const hasPragma = /pragma\s+language_version\s+0\.23/.test(source);
  const hasFunctionAssert = /assert\s*\(\s*n\s*<=\s*1_000_000\s*,\s*"input exceeds documented bound"\s*\)/.test(source);
  const hasDisclose = /last\s*=\s*disclose\s*\(\s*n\s*\)/.test(source);
  // Old statement form was: assert COND "msg"; without parentheses.
  const oldStatementForm = /assert\s+[^(].*"/m.test(source.replace(/\/\/.*$/gm, ''));
  return {
    hasPragma,
    hasFunctionAssert,
    hasDisclose,
    noOldStatementForm: !oldStatementForm,
    ok: hasPragma && hasFunctionAssert && hasDisclose && !oldStatementForm,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = checkInputBoundAssert();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.ok ? 0 : 1);
}
