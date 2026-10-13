/**
 * Latest open-issue sweep for the lab. Does not call a proof server, wallet, indexer, or node.
 * Does not invent APIs. Official docs only: https://docs.midnight.network/
 * Upstream issues read this run (cannot push to those orgs):
 *   https://github.com/midnightntwrk/servicedesk/issues/249
 *   https://github.com/midnightntwrk/servicedesk/issues/243
 *   https://github.com/midnightntwrk/midnight-docs/issues/1527
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

export const UPSTREAM_PURE = 'https://github.com/midnightntwrk/servicedesk/issues/249';
export const UPSTREAM_BODY = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const UPSTREAM_DOCS_FLAGS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const OFFICIAL = 'https://docs.midnight.network/';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const OPEN_ISSUES = Object.freeze([
  { repo: 'servicedesk', number: 249, title: 'pure circuits in contract types compile but every call is refused' },
  { repo: 'servicedesk', number: 243, title: 'proof provider drops the proof-server response body' },
  { repo: 'servicedesk', number: 242, title: 'proof-server image silently drops command-line flags' },
  { repo: 'midnight-docs', number: 1527, title: 'docs still show docker forms that drop flags' },
  { repo: 'midnight-docs', number: 1487, title: 'Test and debug page samples do not run as written' },
  { repo: 'example-hello-world', number: 41, title: 'unused axios and testcontainers dependencies' },
]);

/** Self-check: the sweep doc exists and contains the credit block and at least one upstream link. */
export function checkLatestUpstreamSweep() {
  const failures = [];
  const here = dirname(fileURLToPath(import.meta.url));
  const docPath = join(here, '../../../docs/LATEST-UPSTREAM-SWEEP.md');
  let doc = '';
  try {
    doc = readFileSync(docPath, 'utf8');
  } catch {
    failures.push('docs/LATEST-UPSTREAM-SWEEP.md must exist');
  }
  if (doc && !doc.includes('servicedesk/issues/249')) failures.push('doc must cite #249');
  if (doc && !doc.includes('servicedesk/issues/243')) failures.push('doc must cite #243');
  if (doc && !doc.includes(CREDIT.split('\n')[0])) failures.push('doc must contain the credit block');
  if (OPEN_ISSUES.length < 3) failures.push('must list at least three open issues');
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_PURE,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const result = checkLatestUpstreamSweep();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, issues: OPEN_ISSUES.length, upstream: UPSTREAM_PURE, credit: CREDIT }, null, 2));
}
