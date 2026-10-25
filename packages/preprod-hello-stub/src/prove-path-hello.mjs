/**
 * Source check for the lab hello prove path.
 * Official: https://docs.midnight.network/guides/local-proving
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1383
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

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1383';
export const OFFICIAL = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

export function checkProvePath(source) {
  const code = String(source || '');
  const failures = [];
  if (!/HELLO_OUT\s*=\s*path\.resolve\(here,\s*'\.\.\/\.\.\/\.\.\/contracts\/hello-midnight\/out'\)/.test(code)) {
    failures.push('HELLO_OUT must resolve to contracts/hello-midnight/out');
  }
  if (!/HELLO_CONTRACT\s*=\s*path\.join\(HELLO_OUT,\s*'contract',\s*'index\.js'\)/.test(code)) {
    failures.push('HELLO_CONTRACT must join out/contract/index.js');
  }
  if (!/HELLO_KEYS\s*=\s*path\.join\(HELLO_OUT,\s*'keys'\)/.test(code)) {
    failures.push('HELLO_KEYS must join out/keys');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    claim: 'source check only — not a public indexer or node fix',
    credit: CREDIT,
  };
}

export function checkLabProvePath() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, 'paths.mjs'), 'utf8');
  return checkProvePath(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabProvePath();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
