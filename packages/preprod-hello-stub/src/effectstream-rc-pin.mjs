/**
 * Source check: lab Compact stays on language >= 0.22 && <= 0.23, and guide
 * text that pins compactc 0.33.0-rc.2 or `pragma language_version >= 0.17`
 * is flagged against the public-network matrix.
 * Does not invoke the compiler and does not invent Compact APIs.
 *
 * Official matrix: Compact toolchain 0.31.1.
 * https://docs.midnight.network/relnotes/support-matrix
 * Guide that names 0.33.0-rc.2 (read 2026-10-08):
 * https://docs.midnight.network/guides/build-cross-chain-dapp-with-effectstream
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1245';
export const GUIDE = 'https://docs.midnight.network/guides/build-cross-chain-dapp-with-effectstream';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const MATRIX_TOOLCHAIN = '0.31.1';
export const GUIDE_RC = '0.33.0-rc.2';

export const builderCredit = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function checkEffectstreamRcSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must stay on >= 0.22 && <= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (/0\.33\.0-rc\.2/.test(text)) {
    failures.push('lab contract must not pin compactc 0.33.0-rc.2');
  }
  if (/pragma language_version >= 0\.17\b/.test(text)) {
    failures.push('lab contract must not use pragma language_version >= 0.17');
  }
  if (!/assert\s*\(\s*value\s*<=\s*255/.test(text)) {
    failures.push('storePinned must assert value <= 255 before the Uint<8> cast');
  }
  if (!/disclose\s*\(\s*value\s+as\s+Uint<8>\s*\)/.test(text)) {
    failures.push('the ledger write must disclose the Uint<8> cast');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    matrix: MATRIX,
    toolchain: MATRIX_TOOLCHAIN,
    credit: builderCredit,
  };
}

/**
 * Flag guide text that asks for the rc compiler or a language floor below
 * the public-network pin. Does not claim 0.33.0-rc.2 targets ledger 9;
 * the matrix names that only for 0.34.0 and 0.35.0.
 */
export function checkEffectstreamGuidePin(markdown) {
  const text = String(markdown || '');
  const findings = [];
  if (/0\.33\.0-rc\.2/.test(text)) {
    findings.push(
      'names compactc 0.33.0-rc.2; docs.midnight.network/relnotes/support-matrix lists Compact toolchain 0.31.1 for Preview, Preprod, and Mainnet',
    );
  }
  if (/pragma language_version >= 0\.17\b/.test(text)) {
    findings.push(
      'sample uses pragma language_version >= 0.17; midnight-docs#1245 records the verified public pin as language 0.23.0 with compactc 0.31.1',
    );
  }
  return {
    ok: findings.length === 0,
    findings,
    upstream: UPSTREAM,
    guide: GUIDE,
    matrix: MATRIX,
    matrixToolchain: MATRIX_TOOLCHAIN,
    guideRc: GUIDE_RC,
    claim: 'classification only — not a compiler, indexer, or node fix',
    credit: builderCredit,
  };
}
