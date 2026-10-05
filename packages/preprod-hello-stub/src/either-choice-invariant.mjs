/**
 * Source check for Compact Either and the public-network language pragma.
 * Does not invoke the Compact compiler and does not invent stdlib APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/compact/standard-library/exports
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_EITHER = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_EITHER = 'https://docs.midnight.network/compact/standard-library/exports';

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
 * Flag Compact that would answer the Kapa Either / pragma questions wrong.
 * Official Either is a struct with isLeft, left, and right. Constructors are
 * left<A, B> and right<A, B>. The inactive side should be default<>.
 * Public networks stay on language <= 0.23 (compact update 0.31).
 */
export function checkEitherChoice(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  const bounded = /pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23\s*;/.test(code);
  const unbounded = /pragma\s+language_version\s+>=\s*0\.(2[6-9]|[3-9][0-9])/.test(code);
  if (!bounded) {
    failures.push('public-network pragma must be >= 0.22 && <= 0.23 (not an unbounded ledger-9 pin)');
  }
  if (unbounded) {
    failures.push('unbounded language_version >= 0.26 targets a compiler newer than the public-network pin');
  }
  if (/kernel\s*\.\s*caller\s*\(/.test(code)) {
    failures.push('kernel.caller() is ledger 9 only; do not use it on the public-network pin');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary so left/right resolve to the published circuits');
  }
  if (!/\bleft\s*</.test(code) || !/\bright\s*</.test(code)) {
    failures.push('use published left<A, B> and right<A, B>; do not invent Either constructors');
  }
  if (!/choice\.isLeft/.test(code) && !/\.isLeft/.test(code)) {
    failures.push('read Either.isLeft before disclosing a side');
  }
  if (!/default<Uint<64>>|==\s*0/.test(code)) {
    failures.push('inactive side must stay default<> (Uint<64> default is 0)');
  }
  if (/disclose\s*\(\s*choice\s*\)/.test(code)) {
    failures.push('disclose the populated field, not the whole Either, after the isLeft check');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.22 && <= 0.23',
    compiler: '0.31.1',
    upstream: UPSTREAM_EITHER,
    official: OFFICIAL_EITHER,
    credit: CREDIT,
  };
}
