/**
 * Name the cause when midnight-js deploy construction fails opaquely because
 * the contract runtime does not match midnight-js 4.1.1.
 * Does not call createUnprovenDeployTx and does not invent Compact APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 * Official matrix: https://docs.midnight.network/relnotes/support-matrix
 * Official fix guide: https://docs.midnight.network/how-to/fix-version-mismatches
 * checkRuntimeVersion: https://docs.midnight.network/api-reference/compact-runtime/functions/checkRuntimeVersion
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_RUNTIME_MISMATCH = 'https://github.com/midnightntwrk/servicedesk/issues/236';
export const OFFICIAL_SUPPORT_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_VERSION_FIX = 'https://docs.midnight.network/how-to/fix-version-mismatches';

/** Pins from the official support matrix for this lab. */
export const MATRIX_PINS = Object.freeze({
  compactCompiler: '0.31.1',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  onchainRuntime: '3.0.0',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function flatten(error) {
  const parts = [];
  const seen = new Set();
  const visit = (value, depth) => {
    if (value == null || depth > 6 || seen.has(value)) return;
    if (typeof value === 'string') {
      parts.push(value);
      return;
    }
    if (typeof value !== 'object') return;
    seen.add(value);
    if (typeof value.message === 'string') parts.push(value.message);
    if (typeof value.name === 'string') parts.push(value.name);
    if (value.cause) visit(value.cause, depth + 1);
    for (const key of Object.getOwnPropertyNames(value)) visit(value[key], depth + 1);
    for (const key of Object.getOwnPropertySymbols(value)) visit(value[key], depth + 1);
  };
  visit(error, 0);
  return parts.join('\n');
}

/**
 * Map the two opaque deploy failures from servicedesk#236 onto the matrix pin.
 * @param {unknown} error
 */
export function decodeRuntimeMismatch(error) {
  const text = flatten(error);
  const causes = [];

  if (/coinPublicKey/.test(text) && /ContractConfigurationError|configure constructor context/i.test(text)) {
    causes.push(
      `constructor context has no coinPublicKey: this contract was compiled for a compact-runtime newer than ${MATRIX_PINS.compactRuntime}; midnight-js ${MATRIX_PINS.midnightJs} supports compact-runtime ${MATRIX_PINS.compactRuntime} (compiler ${MATRIX_PINS.compactCompiler}). Recompile with that compiler.`,
    );
  }

  if (/expected instance of ContractMaintenanceAuthority/.test(text)) {
    causes.push(
      `expected instance of ContractMaintenanceAuthority: either a nested onchain-runtime-v3/v4 copy (install one copy at ${MATRIX_PINS.onchainRuntime}) or a ${MATRIX_PINS.compactRuntime} contract on the ledger-9 offline path with one copy. See authority-instance-split.mjs. Not a committee update.`,
    );
  }

  const runtimePin = text.match(/checkRuntimeVersion\(\s*['"]([0-9]+\.[0-9]+\.[0-9]+)['"]\s*\)/);
  if (runtimePin && runtimePin[1] !== MATRIX_PINS.compactRuntime) {
    causes.push(
      `generated contract calls checkRuntimeVersion('${runtimePin[1]}'); midnight-js ${MATRIX_PINS.midnightJs} support-matrix runtime is ${MATRIX_PINS.compactRuntime}.`,
    );
  }

  return {
    ok: causes.length === 0,
    causes,
    pins: MATRIX_PINS,
    upstream: UPSTREAM_RUNTIME_MISMATCH,
    official: OFFICIAL_SUPPORT_MATRIX,
    credit: CREDIT,
  };
}

/**
 * Flag generated contract JS or a package.json that would trip servicedesk#236
 * before deploy construction. Does not compile Compact.
 * @param {string} source
 */
export function checkRuntimePin(source) {
  const raw = String(source || '');
  const failures = [];
  const pins = [...raw.matchAll(/checkRuntimeVersion\(\s*['"]([0-9]+\.[0-9]+\.[0-9]+)['"]\s*\)/g)];
  for (const pin of pins) {
    if (pin[1] !== MATRIX_PINS.compactRuntime) {
      failures.push(
        `checkRuntimeVersion('${pin[1]}') is not the support-matrix runtime ${MATRIX_PINS.compactRuntime} used by midnight-js ${MATRIX_PINS.midnightJs}`,
      );
    }
  }
  if (/compact-runtime["']\s*:\s*["']0\.(19|20)\./.test(raw)) {
    failures.push(
      `package pins compact-runtime 0.19/0.20; midnight-js ${MATRIX_PINS.midnightJs} matrix runtime is ${MATRIX_PINS.compactRuntime}`,
    );
  }
  if (/onchain-runtime-v4/.test(raw)) {
    failures.push(
      `onchain-runtime-v4 is outside the midnight-js ${MATRIX_PINS.midnightJs} matrix (onchain-runtime-v3 ${MATRIX_PINS.onchainRuntime})`,
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    pins: MATRIX_PINS,
    upstream: UPSTREAM_RUNTIME_MISMATCH,
    official: OFFICIAL_VERSION_FIX,
    credit: CREDIT,
  };
}

/**
 * Name the second reproduction in servicedesk#236: two physical copies of
 * @midnight-ntwrk/onchain-runtime-v3, even at the same version. Callers pass
 * paths they already collected (for example `npm list @midnight-ntwrk/onchain-runtime-v3`).
 * This does not walk node_modules, does not call midnight-js, and does not invent an API.
 * @param {readonly string[]} resolvedPaths
 */
export function findDuplicateOnchainCopies(resolvedPaths) {
  const copies = [...new Set((resolvedPaths || []).map((item) => String(item).replace(/\\/g, '/').trim()).filter(Boolean))];
  if (copies.length <= 1) {
    return {
      ok: true,
      copies,
      message: copies.length === 0
        ? 'no @midnight-ntwrk/onchain-runtime-v3 paths supplied'
        : `one copy of @midnight-ntwrk/onchain-runtime-v3 at ${copies[0]}`,
      pins: MATRIX_PINS,
      upstream: UPSTREAM_RUNTIME_MISMATCH,
      official: OFFICIAL_VERSION_FIX,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    copies,
    message: `the contract and midnight-js load different copies of @midnight-ntwrk/onchain-runtime-v3 (${copies.join(', ')}); install one copy at ${MATRIX_PINS.onchainRuntime}`,
    pins: MATRIX_PINS,
    upstream: UPSTREAM_RUNTIME_MISMATCH,
    official: OFFICIAL_VERSION_FIX,
    credit: CREDIT,
  };
}
