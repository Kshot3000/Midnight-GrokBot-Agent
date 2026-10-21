/**
 * Scan Compact source for a persistentHash used to derive ledger state.
 * Does not compile Compact, does not call a proof server, and does not
 * claim a fix of the public indexer or node.
 *
 * Official: https://docs.midnight.network/compact/standard-library/exports
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/203
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/203';
export const OFFICIAL =
  'https://docs.midnight.network/compact/standard-library/exports';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} source
 */
export function classifyPersistentHash(source) {
  const text = String(source ?? '');
  const hasHash = /persistentHash\s*</.test(text);
  const hasAssert = /assert\s*\(/.test(text);
  const hasLedger = /export\s+ledger\s+\w+/.test(text);
  if (hasHash && hasAssert && hasLedger) {
    return {
      ok: true,
      kind: 'persistent-hash-state-derivation',
      title: 'persistentHash used to derive ledger state, then asserted',
      hint: 'Official exports page says persistentHash should derive state data. servicedesk#203 notes it sits in the ~90 MB key floor for state-writing circuits. This classification does not shrink keys.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    kind: 'missing',
    title: 'no persistentHash + assert + ledger pattern',
    hint: 'Look for persistentHash<...>(...) assigned to a ledger field, with an assert on the result. Official: compact/standard-library/exports.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const samplePath = new URL('../../../contracts/hello-midnight/persistent-hash-state.compact', import.meta.url);
  let source = '';
  try {
    source = readFileSync(samplePath, 'utf8');
  } catch {
    source = '';
  }
  const result = classifyPersistentHash(source);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: result.kind }, null, 2));
}
