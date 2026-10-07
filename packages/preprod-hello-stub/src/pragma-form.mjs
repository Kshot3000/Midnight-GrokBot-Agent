/**
 * Classify a Compact language pragma against the official grammar and the
 * three strings official pages still show.
 * Does not invoke the compiler and does not invent a Compact API.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *           https://github.com/LFDT-Minokawa/compact/issues/833
 * Official: https://docs.midnight.network/compact/reference/compact-grammar
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PRAGMA_FORM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const UPSTREAM_COMPACT_PRAGMA = 'https://github.com/LFDT-Minokawa/compact/issues/833';
export const OFFICIAL_PRAGMA_GRAMMAR = 'https://docs.midnight.network/compact/reference/compact-grammar';

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

function pageFor(text) {
  if (/language_version\s+0\.16\b/.test(text)) return 'writing-a-contract';
  if (/language_version\s+>=\s*0\.23\b/.test(text)) return 'troubleshoot-compiler-errors';
  if (/language_version\s+0\.23\.0\b/.test(text)) return 'security-best-practices';
  if (/language_version\s+0\.23\b/.test(text)) return 'bulletin-board';
  return 'other';
}

/**
 * @param {string} source Compact source or a pasted pragma line
 */
export function classifyPragma(source) {
  const code = stripComments(source);
  const match = code.match(
    /pragma\s+language_version\s*((?:>=|<=|>|<|!)?)\s*([0-9]+(?:\.[0-9]+){0,2})\s*;/,
  );
  const failures = [];
  if (!match) {
    failures.push('missing pragma language_version; official grammar is pragma id version-expr ;');
    return {
      ok: false,
      form: null,
      page: 'missing',
      failures,
      labLanguage: '0.23',
      upstream: UPSTREAM_PRAGMA_FORM,
      compactIssue: UPSTREAM_COMPACT_PRAGMA,
      official: OFFICIAL_PRAGMA_GRAMMAR,
      credit: CREDIT,
    };
  }
  const op = match[1] || '=';
  const version = match[2];
  const parts = version.split('.').map(Number);
  const minor = parts.length === 1 ? 0 : parts[1];
  const belowPin = parts[0] === 0 && minor < 23 && op !== '>=' && op !== '>';
  if (belowPin) {
    failures.push(`language ${version} is below the lab pin 0.23 (writing-a-contract still shows 0.16)`);
  }
  if (op === '<' || op === '<=' || op === '!') {
    failures.push(`operator ${op} does not keep the lab language pin 0.23`);
  }
  return {
    ok: failures.length === 0,
    form: `pragma language_version ${op === '=' ? '' : op + ' '}${version};`.replace('  ', ' '),
    op,
    version,
    page: pageFor(match[0]),
    failures,
    labLanguage: '0.23',
    upstream: UPSTREAM_PRAGMA_FORM,
    compactIssue: UPSTREAM_COMPACT_PRAGMA,
    official: OFFICIAL_PRAGMA_GRAMMAR,
    credit: CREDIT,
  };
}
