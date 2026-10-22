/**
 * Source-level invariant for servicedesk#266 return-value observations.
 * Official: https://docs.midnight.network/guides/security-best-practices
 * Does not compile Compact, call midnight-js, or contact any public endpoint.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');

const argSample = readFileSync(join(root, 'contracts/hello-midnight/return-arg-no-disclose.compact'), 'utf8');
const witnessSample = readFileSync(join(root, 'contracts/hello-midnight/return-witness-disclose.compact'), 'utf8');

const credit = 'Built by @kshot9000 https://x.com/kshot9000';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

export function checkReturnValueCommitmentInvariant() {
  assert(argSample.includes('pragma language_version >= 0.23'), 'arg sample missing language pin');
  assert(argSample.includes('return x;'), 'arg sample must return argument without disclose');
  assert(argSample.includes('return a + b;'), 'pure arg sum return missing');
  assert(!argSample.includes('return disclose(x)'), 'arg sample must not force disclose on argument return');
  assert(argSample.includes(credit), 'arg sample missing credit block');

  assert(witnessSample.includes('pragma language_version >= 0.23'), 'witness sample missing language pin');
  assert(witnessSample.includes('return disclose('), 'witness sample must disclose before return');
  assert(witnessSample.includes(credit), 'witness sample missing credit block');

  return {
    ok: true,
    upstream: 'midnightntwrk/servicedesk#266',
    note: 'Return values are a randomized commitment, not ledger data. Arguments may be returned without disclose().',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(checkReturnValueCommitmentInvariant(), null, 2));
}
