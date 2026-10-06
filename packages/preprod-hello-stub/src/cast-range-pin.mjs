/**
 * Source check for contracts/hello-midnight/cast-range-pin.compact and for
 * guide text that still tells builders to pin Compact 0.31.0.
 * Does not invoke the compiler and does not invent Compact APIs.
 *
 * Official: 0.31.0 could drop a range-check on certain casts; 0.31.1 fixes it.
 * https://docs.midnight.network/tokens/unshielded-token
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1245';
export const DOCS = 'https://docs.midnight.network/tokens/unshielded-token';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

export const builderCredit = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function checkCastRangeSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must stay on >= 0.22 && <= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/assert\s*\(\s*value\s*<=\s*255/.test(text)) {
    failures.push('storeByte must assert value <= 255 before the Uint<8> cast');
  }
  if (!/disclose\s*\(\s*value\s+as\s+Uint<8>\s*\)/.test(text)) {
    failures.push('the ledger write must disclose the Uint<8> cast');
  }
  if (/compact update 0\.31\.0/.test(text)) {
    failures.push('source must not instruct compact update 0.31.0');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: DOCS,
  };
}

/**
 * Flag guide markdown that pins the compiler the token tutorial warns about,
 * or that says disclose() publishes. Relative bun-runtime links are the
 * broken route recorded on midnight-docs#1245.
 */
export function checkGuidePin(markdown) {
  const text = String(markdown || '');
  const findings = [];
  if (/compact update 0\.31\.0/.test(text)) {
    findings.push(
      'pins compact update 0.31.0; docs.midnight.network/tokens/unshielded-token says 0.31.1 fixes a dropped range-check, and installation says compact update sets the machine default',
    );
  }
  if (/disclose\(\).*publish/i.test(text) || /what a `disclose\(\)` call publishes/.test(text)) {
    findings.push(
      'describes disclose() as publishing; docs say disclose() only clears the private-data check',
    );
  }
  if (/\.\/install-bun-runtime-midnight/.test(text)) {
    findings.push(
      'relative ./install-bun-runtime-midnight link; midnight-docs#1245 records that slug as /how-to/bun-runtime-midnight',
    );
  }
  return {
    ok: findings.length === 0,
    findings,
    upstream: UPSTREAM,
    docs: DOCS,
    matrix: MATRIX,
  };
}
