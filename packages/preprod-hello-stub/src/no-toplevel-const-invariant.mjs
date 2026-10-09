/**
 * Source check: Compact const is a local binding; top-level const is not in the language.
 * Ledger writes of witness returns need disclose(). Bytes empty values use pad, not {}.
 * Does not invoke the Compact compiler and does not invent APIs.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official const: https://docs.midnight.network/compact/reference/compact-reference
 * Official disclose: https://docs.midnight.network/compact/explicit_disclosure
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_CONST = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_DISCLOSE = 'https://docs.midnight.network/compact/explicit_disclosure';

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
 * Flag the three compile failures named on midnight-docs#1487 for the Test and debug Compact sample.
 * Public networks stay on language <= 0.23 (compact update 0.31).
 */
export function checkNoTopLevelConst(source) {
  const raw = String(source || '');
  const code = stripCommentsAndStrings(raw);
  const failures = [];

  const bounded = /pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23\s*;/.test(code);
  if (!bounded) {
    failures.push('public-network pragma must be >= 0.22 && <= 0.23');
  }

  // Top-level const: a const statement that is not indented under a circuit/constructor body.
  // Simple heuristic: const after a top-level keyword or at start of a non-block line.
  const lines = code.split('\n');
  let depth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (depth === 0 && /^const\s+/.test(trimmed)) {
      failures.push('const is a local binding; top-level const is not in Compact (midnight-docs#1487)');
    }
    depth += (trimmed.match(/\{/g) || []).length;
    depth -= (trimmed.match(/\}/g) || []).length;
    if (depth < 0) depth = 0;
  }

  if (/Bytes\s*<\s*32\s*>\s*\{\s*\}/.test(code)) {
    failures.push('Bytes<32>{} is not a Compact value constructor; use pad(32, "") for empty Bytes<32>');
  }

  // Witness-derived ledger write without disclose nearby.
  if (/witness\s+\w+\s*\(\s*\)\s*:/.test(code) && /=\s*(?!disclose\s*\()/.test(code) && /ledger/.test(code)) {
    // More precise: look for assignment that is not disclose(
    if (!/=\s*disclose\s*\(/.test(code)) {
      failures.push('ledger write of a witness return needs disclose() (explicit disclosure)');
    }
  }

  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary;');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.22 && <= 0.23',
    compiler: '0.31.1',
    upstream: UPSTREAM,
    official: OFFICIAL_CONST,
    credit: CREDIT,
  };
}

export function checkLabInvariant() {
  // The good file is checked by the caller; this self-test uses a known-good snippet.
  const good = `
pragma language_version >= 0.22 && <= 0.23;
import CompactStandardLibrary;
export ledger note: Bytes<32>;
witness localNote(): Bytes<32>;
export circuit storeNote(): [] {
  const raw = localNote();
  note = disclose(raw);
}
`;
  const bad = `
pragma language_version 0.23;
import CompactStandardLibrary;
const top = pad(32, "");
export ledger note: Bytes<32>;
witness localNote(): Bytes<32>;
export circuit storeNote(): [] {
  note = localNote();
}
`;
  const g = checkNoTopLevelConst(good);
  const b = checkNoTopLevelConst(bad);
  const failures = [];
  if (!g.ok) failures.push('good snippet must pass: ' + g.failures.join('; '));
  if (b.ok) failures.push('bad snippet must fail');
  if (b.ok || !b.failures.some((f) => /top-level const/.test(f))) {
    failures.push('bad must flag top-level const');
  }
  return { ok: failures.length === 0, failures, upstream: UPSTREAM, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabInvariant();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
