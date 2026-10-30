/**
 * Compact "can't do yet" invariant — records only documented absences.
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1632
 * Official: https://docs.midnight.network/compact/reference/compact-reference
 *          https://docs.midnight.network/blog/compact-division
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_CANT_DO =
  'https://github.com/midnightntwrk/midnight-docs/issues/1632';
export const OFFICIAL_REFERENCE =
  'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_DIVISION_BLOG =
  'https://docs.midnight.network/blog/compact-division';

/** Documented absences (from official pages only). */
export const DOCUMENTED_ABSENCES = Object.freeze({
  floatingPoint: true,
  nativeDivision: true,
  recursion: true,
  unboundedLoops: true,
  circuitEncryption: 'not described',
  outsideProofVerify: 'not described',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @returns {{ ok: boolean, hint: string }}
 */
export function checkCantDoInvariant() {
  const ok =
    DOCUMENTED_ABSENCES.nativeDivision === true &&
    DOCUMENTED_ABSENCES.recursion === true &&
    DOCUMENTED_ABSENCES.floatingPoint === true;
  return {
    ok,
    hint: ok
      ? 'Recorded documented Compact absences (docs#1632). Use witness+assert for division.'
      : 'Invariant mismatch.',
  };
}

function selfCheck() {
  const result = checkCantDoInvariant();
  console.log(result.ok ? 'PASS' : 'FAIL');
  console.log(result.hint);
  console.log(CREDIT);
  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
