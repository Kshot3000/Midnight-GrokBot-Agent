/**
 * Source check for the assert-private-implicit pin.
 * Confirms the lab Compact file uses assert on a private witness without
 * disclose on the condition, and still discloses on the ledger write.
 * Does not compile, does not invent APIs, does not claim a node or indexer fix.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/compact/reference/writing
 * Pins: Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/writing';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const SRC = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../contracts/hello-midnight/assert-private-implicit-pin.compact',
);

export function checkAssertPrivateImplicitPin(source = readFileSync(SRC, 'utf8')) {
  const hasAssert = /assert\s*\(\s*privateAge\(\)\s*>=\s*18/.test(source);
  const hasDiscloseOnWrite = /counter\s*=\s*disclose\(\s*privateAge\(\)\s*\)/.test(source);
  const noDiscloseOnAssert = !/assert\s*\(\s*disclose\(/.test(source);
  const ok = hasAssert && hasDiscloseOnWrite && noDiscloseOnAssert;

  return {
    ok,
    hasAssert,
    hasDiscloseOnWrite,
    noDiscloseOnAssert,
    hint: ok
      ? 'Matches the official implicit-disclosure rule for assert conditions. Ledger write still uses disclose.'
      : 'Pattern does not match the documented assert-private pin.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export const assertPrivateImplicitCredit = CREDIT;
