/**
 * Source check for the published Hello World contract shape.
 * Does not compile Compact, call proof-server 8.1.0, or deploy.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1396
 * Official sample: https://docs.midnight.network/getting-started/hello-world
 * Preprod guide (separate page): https://docs.midnight.network/guides/deploy-mn-app
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UPSTREAM = 'midnightntwrk/midnight-docs#1396';
export const OFFICIAL = 'https://docs.midnight.network/getting-started/hello-world';
export const PREPROD_GUIDE = 'https://docs.midnight.network/guides/deploy-mn-app';
export const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

export function checkHelloTutorialGap(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+0\.23\s*;/.test(code)) {
    failures.push('pragma must be the tutorial pin: language_version 0.23');
  }
  if (!/export\s+ledger\s+message:\s*Opaque<"string">\s*;/.test(code)) {
    failures.push('ledger message must be Opaque<"string"> as published');
  }
  if (!/export\s+circuit\s+storeMessage\s*\(\s*newMessage:\s*Opaque<"string">\s*\)\s*:\s*\[\]/.test(code)) {
    failures.push('storeMessage signature must match the tutorial');
  }
  if (!/message\s*=\s*disclose\s*\(\s*newMessage\s*\)\s*;/.test(code)) {
    failures.push('storeMessage must assign disclose(newMessage)');
  }
  if (/\bwitness\b/.test(code)) {
    failures.push('do not add a witness; the published tutorial has none');
  }
  if (/export\s+circuit\s+(read|get)Message/.test(code)) {
    failures.push('do not invent a read circuit; public ledger reads are off-chain');
  }
  if (!/yarn test:local/.test(raw)) {
    failures.push('comment must record that the tutorial stops at yarn test:local');
  }
  if (!/midnight-docs\/issues\/1396/.test(raw)) {
    failures.push('comment must cite midnight-docs#1396');
  }
  if (!/docs\.midnight\.network\/getting-started\/hello-world/.test(raw)) {
    failures.push('comment must cite the official tutorial URL');
  }

  return {
    ok: failures.length === 0,
    failures,
    missingFromTutorial: ['witness', 'ledger read-back on the getting-started page', 'Preprod steps on the getting-started page'],
    preprodGuide: PREPROD_GUIDE,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabHelloTutorialGap() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/hello-tutorial-gap.compact'), 'utf8');
  return checkHelloTutorialGap(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabHelloTutorialGap();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, missingFromTutorial: result.missingFromTutorial, credit: CREDIT }, null, 2));
}
