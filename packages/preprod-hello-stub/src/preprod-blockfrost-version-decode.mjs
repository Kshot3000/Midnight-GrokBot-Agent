/**
 * Decode a Preprod system_version string against the support-matrix pin.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/267
 * Official: https://docs.midnight.network/relnotes/support-matrix
 * Does not call any RPC. LOCAL-TRUE. Does not invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/267';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const MATRIX_NODE = '1.0.400';
export const REPORTED = '2.1.0-00000000000';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} version
 * @returns {{ kind: string, note: string, matrixNode: string, upstream: string, credit: string }}
 */
export function decodePreprodNodeVersion(version) {
  const v = String(version ?? '').trim();
  if (v === REPORTED || /-0{8,}$/.test(v)) {
    return {
      kind: 'zero-hash-client',
      note: `Client ${v} has an all-zero commit suffix. Official matrix lists Preprod node ${MATRIX_NODE}. No final 2.1.0 tag exists.`,
      matrixNode: MATRIX_NODE,
      reported: v,
      upstream: UPSTREAM,
      credit: CREDIT,
    };
  }
  if (v.startsWith(`${MATRIX_NODE}-`) && !v.includes('00000000000')) {
    return {
      kind: 'matrix-pin',
      note: `Matches matrix node pin ${MATRIX_NODE} with a real short hash.`,
      matrixNode: MATRIX_NODE,
      reported: v,
      upstream: UPSTREAM,
      credit: CREDIT,
    };
  }
  return {
    kind: 'other',
    note: `Unrecognized system_version ${v}. Compare with matrix pin ${MATRIX_NODE}.`,
    matrixNode: MATRIX_NODE,
    reported: v,
    upstream: UPSTREAM,
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(decodePreprodNodeVersion(REPORTED), null, 2));
}
