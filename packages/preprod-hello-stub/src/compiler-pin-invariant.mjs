/**
 * Compact compiler pin check for the lab.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
 * Official: https://docs.midnight.network/tokens/unshielded-token
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_COMPILER_PIN = 'https://github.com/midnightntwrk/midnight-docs/issues/1245';
export const OFFICIAL_COMPILER_PIN = 'https://docs.midnight.network/tokens/unshielded-token';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Flag a Compact source or shell snippet that would follow the 0.31.0 pin
 * the official unshielded-token tutorial warns about.
 * disclose() is not treated as a publish call: official security docs say
 * it only clears the compiler private-data check.
 */
export function checkCompilerPin(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  const pragma = code.match(/pragma\s+language_version\s*(>=)?\s*([0-9]+)\.([0-9]+)/);
  if (pragma) {
    const major = Number(pragma[2]);
    const minor = Number(pragma[3]);
    if (major < 0 || (major === 0 && minor < 23)) {
      failures.push('language pin must be 0.23 (Compact compiler ~0.31.1 lab pin)');
    }
  }

  if (/compact\s+update\s+0\.31\.0\b/.test(code) && !/0\.31\.1/.test(code)) {
    failures.push('compact update 0.31.0 is the compiler the official token tutorial says can drop a range-check; use 0.31.1');
  }

  if (/disclose\s*\([^)]*\)\s+publishes/.test(raw) || /disclose\(\)\s+publishes/.test(raw)) {
    failures.push('disclose() does not publish; a ledger write, exported return, or contract call does');
  }

  return {
    ok: failures.length === 0,
    failures,
    compiler: '0.31.1',
    language: '0.23',
    upstream: UPSTREAM_COMPILER_PIN,
    official: OFFICIAL_COMPILER_PIN,
    credit: CREDIT,
  };
}
