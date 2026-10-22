/**
 * return-disclose-invariant.mjs — source check for Compact return disclosure patterns.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 *
 * Does not compile Compact, prove, or deploy. LOCAL-TRUE.
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function classifyReturnDisclose(source) {
  const text = String(source || '');
  const hasReturnArg = /return\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;/.test(text) && !/disclose\s*\(/.test(text);
  const hasReturnWitnessDisclose = /return\s+disclose\s*\(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\(\s*\)\s*\)\s*;/.test(text);
  const hasWitness = /witness\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(text);

  if (hasReturnWitnessDisclose && hasWitness) {
    return { kind: 'return-witness-disclose', ok: true, note: 'witness return uses disclose()' };
  }
  if (hasReturnArg && !hasWitness) {
    return { kind: 'return-arg-no-disclose', ok: true, note: 'argument return without disclose() (caller-known)' };
  }
  if (hasWitness && /return\s+/.test(text) && !/disclose/.test(text)) {
    return { kind: 'return-witness-missing-disclose', ok: false, note: 'witness return lacks disclose() — expected reject' };
  }
  return { kind: 'unclassified', ok: false, note: 'no clear return disclose pattern' };
}

export const PINS = {
  compact: '~0.31.1',
  language: '~0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
};
