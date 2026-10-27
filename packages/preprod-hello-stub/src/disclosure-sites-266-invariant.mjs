/**
 * Source invariant for disclosure-sites-266.compact.
 * Checks the patterns reported in servicedesk#266.
 * Does not compile Compact, prove, or call any network.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/explicit-disclosure';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} source Compact source text
 * @returns {{ ok: boolean, checks: Record<string, boolean>, credit: string }}
 */
export function checkDisclosureSites266(source) {
  if (typeof source !== 'string') {
    return { ok: false, checks: {}, credit: CREDIT };
  }
  const checks = {
    returnArgNoDisclose: /export circuit returnArg\([^)]+\): Uint<64> \{\s*return x;/.test(source),
    returnWitnessDisclose: /return disclose\(secretNum\(\)\);/.test(source),
    assertSecretNoDisclose: /assert\(secretNum\(\) > 5/.test(source),
    mapKeyDisclose: /m\.member\(disclose\(k\)\)/.test(source),
    branchDisclose: /if \(disclose\(secretNum\(\) > 5\)\)/.test(source),
    storeDisclose: /val = disclose\(x\);/.test(source),
    languagePin: /pragma language_version >= 0\.22 && <= 0\.23/.test(source),
  };
  const ok = Object.values(checks).every(Boolean);
  return { ok, checks, credit: CREDIT };
}

export { CREDIT };
