/**
 * Classify the runtime type error produced when a hand-built context is
 * passed to an impure circuit. Does not compile Compact, does not call
 * the proof server, and does not submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL = 'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

export function decodeCircuitContextTypeError(message) {
  const text = String(message || '');
  const isTypeError = /type error:/.test(text) && /expected value of type CircuitContext/.test(text);
  const isHandBuilt = /privateState/.test(text) || /ledgerState/.test(text);

  if (!isTypeError) {
    return {
      ok: false,
      kind: 'other',
      hint: 'not a CircuitContext type error',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    kind: 'circuit-context-hand-built',
    hint: 'Build the context with createConstructorContext and createCircuitContext. Do not pass { privateState, ledgerState }. Read state from call.context.currentQueryContext.state.',
    handBuiltShape: isHandBuilt,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const sample = 'type error: post argument 1 (as invoked from Typescript) at bboard.compact line 26 char 1; expected value of type CircuitContext but received { privateState, ledgerState }';
  const result = decodeCircuitContextTypeError(sample);
  if (!result.ok || result.kind !== 'circuit-context-hand-built') {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, kind: result.kind, credit: CREDIT }, null, 2));
}
