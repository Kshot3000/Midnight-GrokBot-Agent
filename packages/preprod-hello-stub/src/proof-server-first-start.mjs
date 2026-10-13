/**
 * Distinguish a proof-server first-start that has not bound the port yet from
 * a key-download exit. Does not run Docker, does not contact a proof server,
 * and does not invent APIs. Does not claim to fix the public proof server,
 * indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Docs: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_FIRST_START =
  'https://github.com/midnightntwrk/servicedesk/issues/242';
export const UPSTREAM_DOCS_FLAGS =
  'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const OFFICIAL_LOCAL_PROVING =
  'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify client or log text seen on a first start of proof-server 8.x.
 * @param {string} text
 */
export function classifyFirstStart(text) {
  const raw = String(text || '');
  const givingUp = /Giving up\.|Failed to fetch data from .+ after 3 attempts/i.test(raw);
  const notReady =
    /ECONNRESET/i.test(raw) ||
    /connection refused/i.test(raw) ||
    /connect ECONNREFUSED/i.test(raw);
  const listening = /listening on:/.test(raw) && !givingUp;

  if (givingUp) {
    return {
      kind: 'key-download-exit',
      ok: false,
      hint: 'Process exited after three key/parameter fetch attempts. Nothing is listening. Use a cache volume at /.cache/midnight and retry. Upstream: ' + UPSTREAM_FIRST_START,
      upstream: UPSTREAM_FIRST_START,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }
  if (notReady) {
    return {
      kind: 'port-not-ready',
      ok: false,
      hint: 'Client reached the port before the proof server finished fetching keys and bound 6300. Wait for /health or the listening log. Upstream: ' + UPSTREAM_FIRST_START,
      upstream: UPSTREAM_FIRST_START,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }
  if (listening) {
    return {
      kind: 'listening',
      ok: true,
      hint: 'Proof server has bound its port.',
      upstream: UPSTREAM_FIRST_START,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }
  return {
    kind: 'unrecognized',
    ok: true,
    hint: 'Not a first-start key-download or port-not-ready shape.',
    upstream: UPSTREAM_FIRST_START,
    official: OFFICIAL_LOCAL_PROVING,
    credit: CREDIT,
  };
}

function selfCheck() {
  const a = classifyFirstStart('Failed to fetch data from http://example/bls after 3 attempts. Giving up.');
  const b = classifyFirstStart('read ECONNRESET');
  const c = classifyFirstStart('listening on: 0.0.0.0:6300');
  const d = classifyFirstStart('ok');
  const ok = a.kind === 'key-download-exit' && !a.ok && b.kind === 'port-not-ready' && !b.ok && c.kind === 'listening' && c.ok && d.kind === 'unrecognized';
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  selfCheck();
}
