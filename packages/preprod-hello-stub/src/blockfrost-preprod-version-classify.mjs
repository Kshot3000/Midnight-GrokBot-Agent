/**
 * Preprod Blockfrost node version string classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/267
 * Official: https://docs.midnight.network/relnotes/support-matrix
 * Does not call any RPC. LOCAL-TRUE.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/267';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_PIN_NODE = '1.0.400';
export const REPORTED_CLIENT = '2.1.0-00000000000';
export const RUNTIME_SPEC = '1000300';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify a reported system_version string against the matrix pin.
 * @param {string} version
 * @param {string} [specVersion]
 * @returns {{ kind: string, note: string, matrixNode: string, upstream: string, credit: string }}
 */
export function classifyBlockfrostPreprodVersion(version, specVersion) {
  const v = String(version || '').trim();
  const spec = String(specVersion || '').trim();
  if (v === REPORTED_CLIENT) {
    return {
      kind: 'unknown-client-build',
      note: `Reported client ${v} matches no published node release tag. Official matrix lists Preprod node ${OFFICIAL_PIN_NODE}. Runtime specVersion ${spec || RUNTIME_SPEC} matches the networks.`,
      matrixNode: OFFICIAL_PIN_NODE,
      reported: v,
      specVersion: spec || RUNTIME_SPEC,
      upstream: UPSTREAM,
      official: OFFICIAL_MATRIX,
      credit: CREDIT,
    };
  }
  if (v.startsWith('1.0.400')) {
    return {
      kind: 'matches-matrix',
      note: `Version ${v} matches the official Preprod node pin.`,
      matrixNode: OFFICIAL_PIN_NODE,
      reported: v,
      specVersion: spec,
      upstream: UPSTREAM,
      official: OFFICIAL_MATRIX,
      credit: CREDIT,
    };
  }
  return {
    kind: 'other',
    note: `Unrecognized version string ${v}. Compare against matrix ${OFFICIAL_PIN_NODE}.`,
    matrixNode: OFFICIAL_PIN_NODE,
    reported: v,
    specVersion: spec,
    upstream: UPSTREAM,
    official: OFFICIAL_MATRIX,
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = classifyBlockfrostPreprodVersion(REPORTED_CLIENT, RUNTIME_SPEC);
  if (sample.kind !== 'unknown-client-build') {
    console.error(sample);
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: sample.kind, credit: CREDIT }, null, 2));
}
