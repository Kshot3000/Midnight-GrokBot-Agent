/**
 * Classify proof-server startup failures caused by the key/parameter download.
 * On 8.x the process fetches ~34 MB before it binds port 6300. Each file gets
 * three attempts with no pause and restarts from byte 0. After three failures
 * it exits with code 1 and the "Giving up." log. Clients then see ECONNRESET
 * or connection refused because nothing is listening yet.
 * Does not run Docker, does not contact a proof server, and does not invent APIs.
 * Does not claim to fix the public proof server, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_KEY_DOWNLOAD =
  'https://github.com/midnightntwrk/servicedesk/issues/242';
export const OFFICIAL_LOCAL_PROVING =
  'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_RUN_PROOF_SERVER =
  'https://docs.midnight.network/guides/run-proof-server';

export const LAB_PROOF_SERVER = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Recommended cache volume so a later start does not re-download. */
export const RECOMMENDED_VOLUME = '-v midnight-zk-params:/.cache/midnight';

/**
 * Classify a log line or client error that appears while the proof server is
 * still fetching keys on first start.
 * @param {string} text docker logs, exit message, or client error
 */
export function classifyProofServerKeyDownload(text) {
  const raw = String(text || '');
  const failures = [];
  const notes = [];

  const givingUp =
    /Giving up\./i.test(raw) ||
    /Failed to fetch data from .+ after 3 attempts/i.test(raw);
  const econn =
    /ECONNRESET/i.test(raw) ||
    /read ECONNRESET/i.test(raw) ||
    /connection refused/i.test(raw);
  const notListening = /nothing listens on 6300|listening on:.*not ready/i.test(raw);

  if (givingUp) {
    failures.push(
      'proof-server exited after three failed key/parameter fetches (no backoff, restart from byte 0). On 8.x this happens before the port is bound.',
    );
    notes.push(
      'Retry the container, or pre-seed a volume at /.cache/midnight and set MIDNIGHT_PROOF_SERVER_NO_FETCH_PARAMS=true so downloads are deferred.',
    );
  }

  if (econn || notListening) {
    failures.push(
      'client saw ECONNRESET or connection refused. On first start the proof server does not listen on 6300 until every key is fetched.',
    );
    notes.push(
      'Wait for the container to stay running and for GET /health or /ready to succeed before calling /check or /prove.',
    );
  }

  const ok = failures.length === 0;

  return {
    ok,
    failures,
    notes,
    kind: givingUp ? 'key-download-exit' : econn || notListening ? 'port-not-ready' : 'unrecognized',
    recommendedVolume: RECOMMENDED_VOLUME,
    pin: '8.1.0',
    claim: 'local classification of startup key-download behaviour — not a proof-server, indexer, or node fix',
    upstream: UPSTREAM_KEY_DOWNLOAD,
    official: OFFICIAL_LOCAL_PROVING,
    credit: CREDIT,
  };
}

/** Self-check used by the vitest / node:test file. */
export function checkProofServerKeyDownload() {
  const failures = [];

  const exit = classifyProofServerKeyDownload(
    'Error: Custom { kind: InvalidData, error: "Failed to fetch data from http://host.docker.internal:8099/bls_midnight_2p10 after 3 attempts. Giving up." }',
  );
  if (exit.ok) failures.push('Giving up must be flagged');
  if (exit.kind !== 'key-download-exit') failures.push('kind for Giving up');
  if (!exit.notes.some((n) => n.includes('/.cache/midnight'))) failures.push('cache note');

  const reset = classifyProofServerKeyDownload('read ECONNRESET');
  if (reset.ok) failures.push('ECONNRESET must be flagged');
  if (reset.kind !== 'port-not-ready') failures.push('kind for ECONNRESET');

  const healthy = classifyProofServerKeyDownload('listening on: 0.0.0.0:6300');
  if (!healthy.ok) failures.push('healthy listen must be ok');
  if (healthy.kind !== 'unrecognized') failures.push('healthy kind');

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_KEY_DOWNLOAD,
    official: OFFICIAL_LOCAL_PROVING,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProofServerKeyDownload();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_KEY_DOWNLOAD, credit: CREDIT }, null, 2));
}
