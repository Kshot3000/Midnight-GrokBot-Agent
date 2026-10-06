/**
 * Pin Compact sources to language >= 0.23 and name the official version-mismatch
 * sentence when a runtime check actually fires.
 * Does not compile Compact, does not call midnight-js, and does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 * Official sentence: https://docs.midnight.network/troubleshoot/compiler-errors
 * Official matrix: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_LANGUAGE_PIN = 'https://github.com/midnightntwrk/servicedesk/issues/236';
export const OFFICIAL_COMPILER_ERRORS = 'https://docs.midnight.network/troubleshoot/compiler-errors';
export const OFFICIAL_SUPPORT_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

export const MATRIX_PINS = Object.freeze({
  compactCompiler: '0.31.1',
  language: '0.23',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const OFFICIAL_MISMATCH =
  /version mismatch:\s*compiled code expects\s+([0-9]+\.[0-9]+\.[0-9]+),\s*runtime is\s+([0-9]+\.[0-9]+\.[0-9]+)/i;

/**
 * A `>= 0.20` floor alone is what servicedesk#236 compiled with 0.34.0 / 0.35.0.
 * @param {string} source
 */
export function checkLanguagePin(source) {
  const raw = String(source || '');
  const failures = [];
  const floors = [...raw.matchAll(/pragma\s+language_version\s*>=\s*([0-9]+)\.([0-9]+)/g)];
  if (floors.length === 0) {
    failures.push(
      'missing `pragma language_version >= 0.23;` (official compiler-errors example). A lower floor can be compiled by 0.34.0/0.35.0.',
    );
  }
  for (const floor of floors) {
    const major = Number(floor[1]);
    const minor = Number(floor[2]);
    const below023 = major < 0 || (major === 0 && minor < 23);
    if (below023) {
      failures.push(
        `pragma language_version >= ${floor[1]}.${floor[2]} is below 0.23. Compiler 0.34.0/0.35.0 can still accept it and emit checkRuntimeVersion('0.19.0') or '0.20.0', which midnight-js ${MATRIX_PINS.midnightJs} does not name on deploy construction (servicedesk#236).`,
      );
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    pins: MATRIX_PINS,
    upstream: UPSTREAM_LANGUAGE_PIN,
    official: OFFICIAL_COMPILER_ERRORS,
    credit: CREDIT,
  };
}

/**
 * Classify the official version-mismatch sentence, or note that deploy
 * construction hid it (servicedesk#236).
 * @param {unknown} error
 */
export function decodeOfficialVersionMismatch(error) {
  const text = flatten(error);
  const match = text.match(OFFICIAL_MISMATCH);
  if (match) {
    const expected = match[1];
    const runtime = match[2];
    const aligned = expected === MATRIX_PINS.compactRuntime && runtime === MATRIX_PINS.compactRuntime;
    return {
      ok: aligned,
      kind: 'official-version-mismatch',
      expected,
      runtime,
      message: aligned
        ? `official version-mismatch sentence names runtime ${runtime}, which matches the support matrix`
        : `version mismatch: compiled code expects ${expected}, runtime is ${runtime}. midnight-js ${MATRIX_PINS.midnightJs} matrix runtime is ${MATRIX_PINS.compactRuntime} (compiler ${MATRIX_PINS.compactCompiler}). Recompile or align @midnight-ntwrk/compact-runtime.`,
      upstream: UPSTREAM_LANGUAGE_PIN,
      official: OFFICIAL_COMPILER_ERRORS,
      credit: CREDIT,
    };
  }
  const opaque = /coinPublicKey|configure constructor context with coin public key|expected instance of ContractMaintenanceAuthority/.test(text);
  if (opaque) {
    return {
      ok: false,
      kind: 'opaque-deploy-construction',
      expected: null,
      runtime: null,
      message:
        `deploy construction failed without the official sentence "version mismatch: compiled code expects X.Y.Z, runtime is A.B.C". That is the servicedesk#236 shape. Align compiler ${MATRIX_PINS.compactCompiler}, compact-runtime ${MATRIX_PINS.compactRuntime}, and one copy of onchain-runtime-v3 3.0.0.`,
      upstream: UPSTREAM_LANGUAGE_PIN,
      official: OFFICIAL_COMPILER_ERRORS,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    kind: 'not-a-runtime-mismatch',
    expected: null,
    runtime: null,
    message: 'no official version-mismatch sentence and no servicedesk#236 deploy-construction string',
    upstream: UPSTREAM_LANGUAGE_PIN,
    official: OFFICIAL_COMPILER_ERRORS,
    credit: CREDIT,
  };
}

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
    if (value.cause) visit(value.cause, depth + 1);
  };
  visit(error, 0);
  return parts.join('\n');
}
