/**
 * Classify Compact runtime version-mismatch errors and the API-reference gap for 0.16.0.
 * Does not call a node, indexer, proof server, or wallet.
 * Does not invent exports. Names come from midnight-docs#1564.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
 * Official matrix: https://docs.midnight.network/relnotes/support-matrix
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, compact-runtime 0.16.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_RUNTIME_API_GAP =
  'https://github.com/midnightntwrk/midnight-docs/issues/1564';
export const OFFICIAL_SUPPORT_MATRIX =
  'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_RUNTIME_API =
  'https://docs.midnight.network/api-reference/compact-runtime';

/** Names the issue says are on the 0.20.0 reference but not exported by 0.16.0. */
export const ABSENT_FROM_016 = Object.freeze([
  'jubjubSchnorrSign',
  'jubjubSchnorrVerifyingKey',
  'sampleJubjubSchnorrSk',
]);

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * @param {unknown} error
 */
export function decodeRuntimeApiGap(error) {
  const text = textOf(error);
  const versionMatch = text.match(
    /Version mismatch: compiled code expects (?<expected>[0-9.]+), runtime is (?<actual>[0-9.]+)/,
  );
  if (versionMatch) {
    const { expected, actual } = versionMatch.groups;
    return {
      ok: true,
      kind: 'version-mismatch',
      expected,
      actual,
      hint: `Compiled contract expects compact-runtime ${expected} but the loaded runtime is ${actual}. Preprod pins 0.16.0 (toolchain 0.31.1). See the support matrix known incompatible combinations. This lab does not change the public packages.`,
      upstream: UPSTREAM_RUNTIME_API_GAP,
      official: OFFICIAL_SUPPORT_MATRIX,
      credit: CREDIT,
    };
  }

  const absent = ABSENT_FROM_016.find((name) => text.includes(name) && /has no exported member|is not exported|Cannot find/.test(text));
  if (absent) {
    return {
      ok: true,
      kind: 'absent-from-016',
      name: absent,
      hint: `${absent} is listed on the compact-runtime 0.20.0 API reference but midnight-docs#1564 states it is not exported by 0.16.0. Stay on the matrix pin or wait for the docs to switch the reference.`,
      upstream: UPSTREAM_RUNTIME_API_GAP,
      official: OFFICIAL_RUNTIME_API,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    kind: 'other',
    hint: 'Not a version-mismatch string or one of the three names called out by midnight-docs#1564.',
    upstream: UPSTREAM_RUNTIME_API_GAP,
    official: OFFICIAL_SUPPORT_MATRIX,
    credit: CREDIT,
  };
}

function selfCheck() {
  const mismatch = decodeRuntimeApiGap(
    'Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0',
  );
  const absent = decodeRuntimeApiGap(
    "Module '" + "@midnight-ntwrk/compact-runtime" + "' has no exported member 'jubjubSchnorrSign'",
  );
  const other = decodeRuntimeApiGap('Failed Proof Server response');
  const ok =
    mismatch.ok &&
    mismatch.kind === 'version-mismatch' &&
    mismatch.expected === '0.16.0' &&
    absent.ok &&
    absent.name === 'jubjubSchnorrSign' &&
    !other.ok;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
