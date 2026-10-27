/**
 * Source-level invariant: pure circuit return of argument sum is accepted
 * without disclose().
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 *
 * Does not call the Compact compiler, midnight-js, or a proof server.
 * Does not claim the public indexer or node is fixed. LOCAL-TRUE.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE = join(__dirname, '../../../contracts/hello-midnight/return-pure-sum-accepted.compact');

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';

export function checkReturnPureSumAccepted() {
  const src = readFileSync(SAMPLE, 'utf8');
  const hasPure = /export pure circuit add/.test(src);
  const hasReturn = /return a \+ b/.test(src);
  const noDiscloseOnReturn = !/return disclose\(a \+ b\)/.test(src);
  const languagePin = /pragma language_version >= 0\.22 && <= 0\.23/.test(src);
  return {
    ok: hasPure && hasReturn && noDiscloseOnReturn && languagePin,
    hasPure,
    hasReturn,
    noDiscloseOnReturn,
    languagePin,
    upstream: UPSTREAM,
    note: 'Source check only. Does not compile or prove.',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkReturnPureSumAccepted();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
