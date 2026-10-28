/**
 * Classifier for the Compact runtime 0.16.0 export gap reported in
 * midnightntwrk/midnight-docs#1564.
 * Official matrix pins runtime 0.16.0; the API reference documents 0.20.0.
 * Does not invent APIs or call any network.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';

const SCHNORR_NAMES = [
  'jubjubSchnorrSign',
  'jubjubSchnorrVerifyingKey',
  'sampleJubjubSchnorrSk',
];

/**
 * @param {unknown} err
 * @returns {{ kind: string, notes: string[] }}
 */
export function classifyRuntimeExportGap(err) {
  const text = typeof err === 'string' ? err : (err && err.message) || String(err || '');
  const notes = [];
  let kind = 'unknown';

  if (/has no exported member/.test(text) && SCHNORR_NAMES.some((n) => text.includes(n))) {
    kind = 'schnorr-not-in-016';
    notes.push('The name is on the 0.20.0 reference but not exported from compact-runtime 0.16.0 (matrix pin).');
  }

  if (/Version mismatch/.test(text) && /0\.16\.0/.test(text) && /0\.20\.0/.test(text)) {
    kind = 'runtime-version-mismatch';
    notes.push('compiled code expects 0.16.0, runtime is 0.20.0 (or reverse). Stay on the support matrix.');
  }

  return { kind, notes };
}

export const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;
