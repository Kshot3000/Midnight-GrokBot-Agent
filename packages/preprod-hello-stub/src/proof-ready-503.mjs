/**
 * Classify a proof-server GET /ready 503 (all workers busy).
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public proof server or midnight-js.
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Related upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_RELATED =
  'https://github.com/midnightntwrk/servicedesk/issues/242';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} text response status, body, or client error mentioning /ready
 */
export function classifyProofReady503(text) {
  const raw = String(text || '');
  const is503 =
    /\b503\b/.test(raw) &&
    (/\/ready/i.test(raw) || /Service Unavailable/i.test(raw) || /all workers/i.test(raw) || /busy/i.test(raw));
  const is200 = /\b200\b/.test(raw) && /\/ready/i.test(raw);

  if (is503) {
    return {
      ok: true,
      kind: 'ready-503-busy',
      hint: 'GET /ready returned 503. Official docs: server is busy (all workers occupied). Wait for current proofs or increase worker count. Distinct from 429 JobQueueFull on prove endpoints.',
      upstream: UPSTREAM_RELATED,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  if (is200) {
    return {
      ok: true,
      kind: 'ready-200',
      hint: 'GET /ready returned 200. Server is ready to accept proof requests.',
      upstream: UPSTREAM_RELATED,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    kind: 'unrecognized',
    hint: 'Not a recognized /ready status. Official table: 200 OK = ready, 503 = all workers busy.',
    upstream: UPSTREAM_RELATED,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

export function checkProofReady503() {
  const busy = classifyProofReady503('GET /ready -> 503 Service Unavailable');
  const ok = classifyProofReady503('GET /ready 200 OK');
  const other = classifyProofReady503('connection refused');
  const pass = busy.kind === 'ready-503-busy' && ok.kind === 'ready-200' && other.kind === 'unrecognized';
  return {
    ok: pass,
    busy: busy.kind,
    ready: ok.kind,
    other: other.kind,
    upstream: UPSTREAM_RELATED,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProofReady503();
  console.log(JSON.stringify(result, null, 2));
  console.log(CREDIT);
  process.exit(result.ok ? 0 : 1);
}
