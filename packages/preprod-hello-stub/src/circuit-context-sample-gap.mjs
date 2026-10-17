/**
 * Classify the circuit-context type error described in midnight-docs#1487.
 * Does not call a circuit, does not contact a node or proof server, and does
 * not invent an API.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official working pattern:
 *   https://docs.midnight.network/guides/compact-javascript-runtime
 * Lab pin: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const WORKING = 'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} message
 */
export function decodeCircuitContextTypeError(message) {
  const text = typeof message === 'string' ? message : '';
  const expectsContext = /expected value of type CircuitContext/i.test(text);
  const plainObject = /privateState|ledgerState/.test(text) && /type error/i.test(text);

  if (!text.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      hint: 'Pass the generated-code type-error text. This helper does not call a circuit.',
      upstream: UPSTREAM,
      credit: CREDIT,
    };
  }

  if (expectsContext || plainObject) {
    return {
      ok: true,
      classification: 'circuit-context-mismatch',
      title: 'plain object passed where CircuitContext is required',
      hint: 'Build context with createCircuitContext (or createConstructorContext). See the working samples on the Compact JavaScript runtime guide.',
      upstream: UPSTREAM,
      working: WORKING,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'not the #1487 CircuitContext mismatch',
    upstream: UPSTREAM,
    credit: CREDIT,
  };
}
