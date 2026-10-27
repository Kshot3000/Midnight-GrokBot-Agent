/**
 * Lab invariant: pure exported circuit returning arguments needs no disclose().
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 * Source-level check only. Does not compile, prove, or deploy.
 * Does not claim a fix of the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const EXPECTED_PURE_RETURN = 'return a + b;';
export const REQUIRES_DISCLOSE = 'return disclose(secretNum());';

/** True when source matches the pure-arg return pattern from servicedesk#266. */
export function isPureArgReturnPattern(source) {
  return typeof source === 'string'
    && source.includes('export pure circuit')
    && source.includes(EXPECTED_PURE_RETURN)
    && source.includes(REQUIRES_DISCLOSE);
}
