/**
 * Source check for contracts/hello-midnight/safe-downcast.compact.
 * Does not invoke the compiler and does not invent Compact APIs.
 *
 * Official: 0.31.1 keeps a guarded unsigned downcast distinct from an
 * unguarded one of the same value.
 * https://docs.midnight.network/relnotes/compact/toolchain-0.31.1
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1245';
export const DOCS = 'https://docs.midnight.network/relnotes/compact/toolchain-0.31.1';
export const UNTAKEN = 'https://docs.midnight.network/relnotes/compact/toolchain-0.31.0';

export const builderCredit = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function checkSafeDowncastSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must stay on >= 0.22 && <= 0.23');
  }
  if (!/assert\s*\(\s*value\s*<=\s*255/.test(text)) {
    failures.push('bound assert must stay explicit before the Uint<8> cast');
  }
  const assertAt = text.search(/assert\s*\(\s*value\s*<=\s*255/);
  const ifAt = text.search(/\bif\s*\(/);
  if (assertAt < 0 || ifAt < 0 || assertAt > ifAt) {
    failures.push('assert must stay outside the conditional (0.31.0 both-branches note)');
  }
  if (!/disclose\s*\(\s*value\s+as\s+Uint<8>\s*\)/.test(text)) {
    failures.push('ledger write must disclose the Uint<8> cast');
  }
  if (/compact update 0\.31\.0/.test(text)) {
    failures.push('source must not instruct compact update 0.31.0');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: DOCS,
    untaken: UNTAKEN,
  };
}

export function checkSafeDowncastFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  return checkSafeDowncastSource(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const here = dirname(fileURLToPath(import.meta.url));
  const target = join(here, '../../../contracts/hello-midnight/safe-downcast.compact');
  const result = checkSafeDowncastFile(target);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, docs: DOCS }, null, 2));
}
