/**
 * Decode the AbortError that midnight-js 4.1.1 surfaces for a proof-server timeout.
 * Does not call the proof server, does not invent response schemas, and does not
 * claim a fix of midnight-js, the proof server, or any public node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/guides/run-proof-server
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL = 'https://docs.midnight.network/guides/run-proof-server';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {unknown} raw
 * @returns {{ ok: boolean, kind: string, note: string, upstream: string, official: string, credit: string }}
 */
export function decodeProofProviderTimeout(raw) {
  const text = String(raw ?? '');
  const isAbort = /The user aborted a request\./i.test(text) || /AbortError/i.test(text);
  if (isAbort) {
    return {
      ok: true,
      kind: 'timeout-as-abort',
      note: 'midnight-js 4.1.1 reports AbortSignal.timeout as AbortError: The user aborted a request. (servicedesk#243). This is a timeout, not a user cancel.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    kind: 'other',
    note: 'Not the timeout-as-abort shape from servicedesk#243.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = decodeProofProviderTimeout('AbortError: The user aborted a request.');
  const b = decodeProofProviderTimeout('Failed Proof Server response: code="400"');
  const ok = a.ok && a.kind === 'timeout-as-abort' && !b.ok;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}
