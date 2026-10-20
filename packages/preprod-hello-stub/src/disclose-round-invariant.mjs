/**
 * Source invariant for contracts/hello-midnight/disclose-round.compact.
 * Checks the official writing-guide shape: disclose around the publicKey
 * hash, a round Counter, and increment on rotate. Does not compile Compact,
 * does not call proof-server 8.1.0, and does not submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/compact/reference/writing
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
export const OFFICIAL_WRITING = 'https://docs.midnight.network/compact/reference/writing';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function checkDiscloseRoundSource(source) {
  const text = String(source);
  const issues = [];
  if (!/pragma\s+language_version\s+>=\s+0\.23/.test(text)) {
    issues.push('missing language pin >= 0.23');
  }
  if (!/export\s+ledger\s+round:\s*Counter/.test(text)) {
    issues.push('missing round: Counter ledger');
  }
  if (!/authority\s*=\s*disclose\(publicKey\(round,\s*sk\)\)/.test(text)) {
    issues.push('setAuthority must disclose the publicKey hash');
  }
  if (!/round\.increment\(1\)/.test(text)) {
    issues.push('rotate must increment the round counter');
  }
  if (!/witness\s+secretKey\(\)/.test(text)) {
    issues.push('missing secretKey witness');
  }
  return { ok: issues.length === 0, issues, credit: CREDIT };
}

export function loadDiscloseRoundSource() {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = join(here, '../../../contracts/hello-midnight/disclose-round.compact');
  return readFileSync(path, 'utf8');
}

export function runDiscloseRoundInvariant() {
  const source = loadDiscloseRoundSource();
  const result = checkDiscloseRoundSource(source);
  result.upstream = UPSTREAM;
  result.official = OFFICIAL_WRITING;
  return result;
}
