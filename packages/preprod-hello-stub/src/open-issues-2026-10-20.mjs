/**
 * Open-issue snapshot for 2026-10-20 run.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not invent APIs. Official docs only: https://docs.midnight.network/
 * Cannot push to midnightntwrk orgs.
 *
 * Upstream read this run:
 *   https://github.com/midnightntwrk/servicedesk/issues/257
 *   https://github.com/midnightntwrk/servicedesk/issues/254
 *   https://github.com/midnightntwrk/midnight-docs/issues/1577
 *   https://github.com/midnightntwrk/midnight-docs/issues/1569
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

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/257';
export const OFFICIAL = 'https://docs.midnight.network/';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const OPEN_ISSUES = Object.freeze([
  { repo: 'servicedesk', number: 257, title: 'Mainnet contract deploys stay pending until TTL' },
  { repo: 'servicedesk', number: 254, title: 'Faucet POST /drips multiplies amount by 5 tNIGHT' },
  { repo: 'midnight-docs', number: 1577, title: 'Retire the bboard tutorial and Examples page' },
  { repo: 'midnight-docs', number: 1569, title: 'Wallet and connector pages: stale lines' },
  { repo: 'example-hello-world', number: 41, title: 'chore: remove unused dependencies' },
]);

export function checkOpenIssuesSnapshot() {
  const failures = [];
  if (OPEN_ISSUES.length < 4) failures.push('must list at least four open issues');
  const has257 = OPEN_ISSUES.some((i) => i.number === 257);
  if (!has257) failures.push('must include servicedesk#257');
  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT, issues: OPEN_ISSUES.length };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkOpenIssuesSnapshot();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, issues: OPEN_ISSUES.length, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
