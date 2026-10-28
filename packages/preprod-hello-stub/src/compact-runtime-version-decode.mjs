/**
 * Decode Compact runtime version mismatch errors seen on ledger 8 networks.
 *
 * Official sources:
 * - https://docs.midnight.network/relnotes/support-matrix
 * - https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * Upstream: midnightntwrk/midnight-docs#1564
 *
 * Pins: Compact toolchain ~0.31.1 (expects runtime 0.16.0), language ~0.23,
 * midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 */

const MATRIX_RUNTIME = '0.16.0';
const MATRIX_TOOLCHAIN = '0.31.1';

/**
 * @param {unknown} err
 * @returns {{ kind: string, expected?: string, actual?: string, fix: string, matrixPair: boolean } | null}
 */
export function decodeCompactRuntimeVersion(err) {
  const msg = err && typeof err === 'object' && 'message' in err ? String(err.message) : String(err ?? '');
  const m = msg.match(/Version mismatch:\s*compiled code expects\s+([0-9.]+),\s*runtime is\s+([0-9.]+)/i);
  if (!m) return null;

  const expected = m[1];
  const actual = m[2];
  const matrixPair = expected === MATRIX_RUNTIME;

  let fix = `Pin Compact toolchain ${MATRIX_TOOLCHAIN} (\`compact update ${MATRIX_TOOLCHAIN}\`) and \`@midnight-ntwrk/compact-runtime@${MATRIX_RUNTIME}\`. See https://docs.midnight.network/relnotes/support-matrix.`;
  if (!matrixPair) {
    fix = `Compiled code expects runtime ${expected} (ledger 9 toolchain). Public networks run ledger 8 with runtime ${MATRIX_RUNTIME}. Recompile with toolchain ${MATRIX_TOOLCHAIN} or stay on a ledger 9 environment. ${fix}`;
  } else if (actual !== MATRIX_RUNTIME) {
    fix = `Installed runtime is ${actual}; matrix for Preview/Preprod/Mainnet requires ${MATRIX_RUNTIME}. ${fix}`;
  }

  return {
    kind: 'compact-runtime-version-mismatch',
    expected,
    actual,
    fix,
    matrixPair,
  };
}

/**
 * @param {unknown} err
 * @returns {string}
 */
export function formatCompactRuntimeVersion(err) {
  const decoded = decodeCompactRuntimeVersion(err);
  if (!decoded) return String(err ?? 'unknown error');
  return `${decoded.kind}: expects ${decoded.expected}, got ${decoded.actual}. ${decoded.fix}`;
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
