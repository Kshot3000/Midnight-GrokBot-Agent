/**
 * Source check: public-network Compact has no bitwise operators.
 * Does not invoke the Compact compiler and does not invent stdlib APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/compact/reference/compact-grammar
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_BITWISE = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_GRAMMAR = 'https://docs.midnight.network/compact/reference/compact-grammar';
export const OFFICIAL_ARITHMETIC = 'https://docs.midnight.network/compact/reference/compact-reference#binary-arithmetic-expressions';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripCommentsAndStrings(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

/**
 * Flag Compact that would answer the Kapa bitwise question with an invented operator.
 * Published grammar has || and &&, not &, |, ^, <<, >>, or >>>.
 * Public networks stay on language <= 0.23 (compact update 0.31).
 */
export function checkNoBitwise(source) {
  const raw = String(source || '');
  const code = stripCommentsAndStrings(raw);
  const failures = [];

  const bounded = /pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23\s*;/.test(code);
  if (!bounded) {
    failures.push('public-network pragma must be >= 0.22 && <= 0.23');
  }
  if (/<<|>>>|>>/.test(code)) {
    failures.push('shift operators << >> >>> are not in the published Compact grammar');
  }
  const withoutLogical = code.replace(/&&/g, ' ').replace(/\|\|/g, ' ');
  if (/[&|^]/.test(withoutLogical)) {
    failures.push('bitwise & | ^ are not in the published Compact grammar; || and && are the logical operators');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary; stdlib exports do not add a shift circuit');
  }
  if (!/flag\s*\?\s*1\s*:\s*0/.test(code)) {
    failures.push('fold a Boolean with the documented ternary (flag ? 1 : 0), not a bit operator');
  }
  if (!/disclose\s*\(/.test(code)) {
    failures.push('ledger write of the folded flag needs disclose()');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.22 && <= 0.23',
    compiler: '0.31.1',
    operatorsPresent: ['+', '-', '*', '||', '&&', '==', '!=', '<', '<=', '>', '>='],
    operatorsAbsent: ['&', '|', '^', '<<', '>>', '>>>'],
    upstream: UPSTREAM_BITWISE,
    official: OFFICIAL_GRAMMAR,
    credit: CREDIT,
  };
}
