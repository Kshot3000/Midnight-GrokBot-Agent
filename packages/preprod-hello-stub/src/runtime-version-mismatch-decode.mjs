/**
 * Decode the Compact runtime version-mismatch error that the generated module throws at import.
 * Official messages from the support matrix. Does not call a node, indexer, or proof server.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
 * Support matrix: https://docs.midnight.network/relnotes/support-matrix
 * Compact JS guide: https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_JS_GUIDE = 'https://docs.midnight.network/guides/compact-javascript-runtime';

/** Pins for the public networks (ledger 8). */
export const MATRIX_TOOLCHAIN = '0.31.1';
export const MATRIX_RUNTIME = '0.16.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const VERSION_MISMATCH =
  /Version mismatch:\s*compiled code expects\s+([0-9.]+),\s*runtime is\s+([0-9.]+)/i;

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Classify an import-time runtime version mismatch.
 * @param {unknown} error
 * @returns {{ kind: string, ok: boolean, expected: string | null, actual: string | null, hint: string, upstream: string, official: string, credit: string }}
 */
export function decodeRuntimeVersionMismatch(error) {
  const text = textOf(error);
  const m = text.match(VERSION_MISMATCH);
  if (!m) {
    return {
      kind: 'unrecognized',
      ok: false,
      expected: null,
      actual: null,
      hint: 'no "Version mismatch: compiled code expects X, runtime is Y" string. The generated module throws this at import when the runtime does not match the toolchain.',
      upstream: UPSTREAM,
      official: OFFICIAL_MATRIX,
      credit: CREDIT,
    };
  }
  const expected = m[1];
  const actual = m[2];
  const onMatrix =
    expected === MATRIX_RUNTIME && actual !== MATRIX_RUNTIME
      ? false
      : expected === MATRIX_RUNTIME && actual === MATRIX_RUNTIME;

  let hint;
  if (expected === MATRIX_RUNTIME) {
    hint = `Compiled with toolchain that expects runtime ${MATRIX_RUNTIME} (matrix pin for Preprod/Preview/Mainnet). Installed runtime is ${actual}. Run: npm install @midnight-ntwrk/compact-runtime@${MATRIX_RUNTIME}`;
  } else if (actual === MATRIX_RUNTIME) {
    hint = `Compiled with a ledger-9 toolchain (expects ${expected}) but running the matrix runtime ${MATRIX_RUNTIME}. Recompile with compact update ${MATRIX_TOOLCHAIN} or do not deploy to ledger-8 networks.`;
  } else {
    hint = `Version mismatch (expected ${expected}, runtime ${actual}). Check the support matrix and pin both sides.`;
  }

  return {
    kind: 'runtime-version-mismatch',
    ok: onMatrix,
    expected,
    actual,
    hint,
    upstream: UPSTREAM,
    official: OFFICIAL_MATRIX,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0';
  const decoded = decodeRuntimeVersionMismatch(sample);
  const ok =
    decoded.kind === 'runtime-version-mismatch' &&
    decoded.expected === '0.16.0' &&
    decoded.actual === '0.20.0' &&
    !decoded.ok;
  if (!ok) {
    console.error(JSON.stringify(decoded, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, expected: decoded.expected, actual: decoded.actual, credit: CREDIT }, null, 2));
}
