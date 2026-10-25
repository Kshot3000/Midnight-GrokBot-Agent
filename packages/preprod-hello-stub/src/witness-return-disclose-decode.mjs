/**
 * Decode the Compact compiler error for returning a witness value without disclose().
 * Does not compile, prove, or call any network.
 *
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/explicit-disclosure';

/** Signature of the compiler error quoted in servicedesk#266 and the official page. */
export const WITNESS_RETURN_DISCLOSE_ERROR = Object.freeze({
  mustDeclare: 'potential witness-value disclosure must be declared but is not',
  nature: 'the value returned from exported circuit',
  mightDisclose: 'might disclose the witness value',
});

/**
 * Classify a Compact compiler stderr line for the witness-return disclosure case.
 * Returns a short reason or null if not matched.
 * @param {string} line
 * @returns {string|null}
 */
export function decodeWitnessReturnDisclose(line) {
  if (!line || typeof line !== 'string') return null;
  const s = line.toLowerCase();
  if (
    s.includes('potential witness-value disclosure must be declared') &&
    s.includes('returned from exported circuit') &&
    s.includes('witness')
  ) {
    return 'witness-return-needs-disclose';
  }
  return null;
}

const CREDIT = `
Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
`;

export { CREDIT };
