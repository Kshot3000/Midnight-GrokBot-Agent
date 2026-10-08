/**
 * Source check for the official "disclose the boolean, not the value" pattern.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/guides/security-best-practices
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkDiscloseBoolean(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact compiler ~0.31.1 lab pin)');
  }
  if (!/export\s+ledger\s+adult:\s*Boolean/.test(code)) {
    failures.push('adult must be Boolean, not the age');
  }
  if (!/export\s+circuit\s+markAdult\s*\(\s*age:\s*Uint<8>\s*\)\s*:\s*Boolean/.test(code)) {
    failures.push('markAdult must take age: Uint<8> and return Boolean');
  }
  if (/age:\s*Field/.test(code)) {
    failures.push('comparisons like >= work on Uint<N>, not Field');
  }
  if (!/const\s+ok\s*=\s*disclose\s*\(\s*age\s*>=\s*18\s*\)/.test(code)) {
    failures.push('must disclose the comparison disclose(age >= 18), not the value');
  }
  if (/disclose\s*\(\s*age\s*\)/.test(code)) {
    failures.push('do not disclose age itself');
  }
  if (/adult\s*=\s*age\b/.test(code) || /return\s+age\b/.test(code)) {
    failures.push('do not publish age through a ledger write or an exported return');
  }
  if (!/adult\s*=\s*ok\s*;/.test(code) || !/return\s+ok\s*;/.test(code)) {
    failures.push('ledger write and return must be the disclosed boolean');
  }
  if (!/disclose the boolean result, not the value/.test(raw)) {
    failures.push('comment must cite the official disclose-boolean sentence');
  }

  return {
    ok: failures.length === 0,
    failures,
    form: 'disclose(age >= 18)',
    upstream: UPSTREAM,
    official: OFFICIAL,
    claim: 'source check only — not a public indexer or node fix',
    credit: CREDIT,
  };
}

export function checkLabDiscloseBoolean() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(
    join(here, '../../../contracts/hello-midnight/disclose-boolean.compact'),
    'utf8',
  );
  return checkDiscloseBoolean(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabDiscloseBoolean();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, form: result.form, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
