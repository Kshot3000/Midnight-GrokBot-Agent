/**
 * Source check for the Map-key disclose case reported in
 * https://github.com/midnightntwrk/servicedesk/issues/266
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 *           https://docs.midnight.network/compact/reference/writing
 *
 * LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the
 * public indexer/node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL_EXPLICIT = 'https://docs.midnight.network/compact/reference/explicit-disclosure';
export const OFFICIAL_WRITING = 'https://docs.midnight.network/compact/reference/writing';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkMapKeyDisclose(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.22\s*&&\s*<=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.22 && <= 0.23');
  }
  if (!/export\s+ledger\s+m:\s*Map<Bytes<32>,\s*Uint<64>>/.test(code)) {
    failures.push('ledger m must be Map<Bytes<32>, Uint<64>>');
  }
  if (!/export\s+circuit\s+hasKey\s*\(\s*k:\s*Bytes<32>\s*\)\s*:\s*\[\]\s*\{\s*assert\(\s*m\.member\(\s*disclose\(\s*k\s*\)\s*\)\s*,\s*"missing"\s*\)/.test(code)) {
    failures.push('hasKey must assert m.member(disclose(k))');
  }
  if (/m\.member\(\s*k\s*\)/.test(code)) {
    failures.push('bare m.member(k) is the form the issue reports as rejected');
  }
  if (!/m\.insert\(\s*disclose\(\s*k\s*\)\s*,\s*disclose\(\s*v\s*\)\s*\)/.test(code)) {
    failures.push('setKey must insert disclose(k), disclose(v)');
  }
  if (!/servicedesk#266/.test(raw) && !/issues\/266/.test(raw)) {
    failures.push('comment must cite servicedesk#266');
  }

  return {
    ok: failures.length === 0,
    failures,
    form: 'assert(m.member(disclose(k)), "missing")',
    upstream: UPSTREAM,
    official: [OFFICIAL_EXPLICIT, OFFICIAL_WRITING],
    claim: 'source check only — not a public indexer or node fix',
    credit: CREDIT,
  };
}

export function checkLabMapKeyDisclose() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(
    join(here, '../../../contracts/hello-midnight/map-key-disclose.compact'),
    'utf8',
  );
  return checkMapKeyDisclose(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabMapKeyDisclose();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, form: result.form, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
