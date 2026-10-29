/**
 * Open-issue snapshot for the 2026-10-29 run.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not invent APIs. Official docs only: https://docs.midnight.network/
 * Cannot push to midnightntwrk orgs.
 *
 * Upstream read this run:
 *   https://github.com/midnightntwrk/servicedesk/issues/267
 *   https://github.com/midnightntwrk/servicedesk/issues/266
 *   https://github.com/midnightntwrk/midnight-docs/issues/1587
 *   https://github.com/midnightntwrk/midnight-docs/issues/1564
 *   https://github.com/midnightntwrk/example-hello-world/issues/41
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/267';
export const OFFICIAL = 'https://docs.midnight.network/';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const OPEN_ISSUES = Object.freeze([
  { repo: 'servicedesk', number: 267, title: 'Blockfrost Preprod node version string' },
  { repo: 'servicedesk', number: 266, title: 'Explicit disclosure return values and disclose rules' },
  { repo: 'midnight-docs', number: 1587, title: 'Quickstart create-mn-app replacement' },
  { repo: 'midnight-docs', number: 1564, title: 'Compact runtime API reference version gap' },
  { repo: 'example-hello-world', number: 41, title: 'unused axios and testcontainers' },
]);

export function checkOpenIssues20261029() {
  const failures = [];
  const here = dirname(fileURLToPath(import.meta.url));
  const docPath = join(here, '../../../docs/OPEN-ISSUES-2026-10-29.md');
  let doc = '';
  try {
    doc = readFileSync(docPath, 'utf8');
  } catch {
    failures.push('docs/OPEN-ISSUES-2026-10-29.md must exist');
  }
  if (doc && !doc.includes('servicedesk/issues/267')) failures.push('doc must cite #267');
  if (doc && !doc.includes('servicedesk/issues/266')) failures.push('doc must cite #266');
  if (doc && !doc.includes(CREDIT.split('\n')[0])) failures.push('doc must contain the credit block');
  if (OPEN_ISSUES.length < 4) failures.push('must list at least four open issues');
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
    issues: OPEN_ISSUES.length,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkOpenIssues20261029();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, issues: OPEN_ISSUES.length, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
