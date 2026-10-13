/**
 * Classify how a proof-server docker/compose form sets its listen port.
 * The image entrypoint is bash -c "midnight-proof-server --port $PORT",
 * so flags after the image name are dropped and MIDNIGHT_PROOF_SERVER_PORT
 * is overridden by the image's own --port $PORT.
 * Does not run Docker, does not contact a proof server, and does not invent APIs.
 * Does not claim to fix the public proof server, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Related: https://github.com/midnightntwrk/servicedesk/issues/242
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: proof-server 8.1.0, Compact ~0.31.1, midnight-js 4.1.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_DOCS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const UPSTREAM_IMAGE = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const OFFICIAL = 'https://docs.midnight.network/guides/local-proving';

export const LAB_IMAGE = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} text docker run line or compose environment block
 */
export function classifyProofServerPortEnv(text) {
  const raw = String(text || '');
  const failures = [];
  const notes = [];

  const afterImagePort = /midnight-proof-server\s+--port\b/.test(raw);
  const afterImageOther = /midnight-proof-server\s+(-v|--network|--help)/.test(raw);
  const usesWrongEnv = /MIDNIGHT_PROOF_SERVER_PORT\s*=/.test(raw);
  const usesPortEnv = /(?:^|\s|-e\s+)PORT\s*=\s*\d+/.test(raw) || /PORT:\s*['"]?\d+/.test(raw);
  const usesVerboseEnv = /MIDNIGHT_PROOF_SERVER_VERBOSE\s*=\s*true/i.test(raw);

  if (afterImagePort || afterImageOther) {
    failures.push(
      'flags after the image name never reach the binary (entrypoint is bash -c "midnight-proof-server --port $PORT").',
    );
  }
  if (usesWrongEnv) {
    failures.push(
      'MIDNIGHT_PROOF_SERVER_PORT is overridden by the image\'s own --port $PORT; the server still listens on 6300. Use -e PORT=... instead.',
    );
  }
  if (usesPortEnv) {
    notes.push('PORT env reaches the image entrypoint and moves the listen port inside the container.');
  }
  if (usesVerboseEnv) {
    notes.push('MIDNIGHT_PROOF_SERVER_VERBOSE=true enables DEBUG logs without a dropped -v flag.');
  }

  const ok = failures.length === 0;

  return {
    ok,
    failures,
    notes,
    usesPortEnv,
    usesWrongEnv,
    afterImageFlag: afterImagePort || afterImageOther,
    pin: '8.1.0',
    claim: 'local classification of image port env behaviour \u2014 not a proof-server, indexer, or node fix',
    upstream: UPSTREAM_DOCS,
    imageIssue: UPSTREAM_IMAGE,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkProofServerPortEnv() {
  const failures = [];

  const dropped = classifyProofServerPortEnv(
    `docker run -p 6300:6300 ${LAB_IMAGE} midnight-proof-server --port 7000`,
  );
  if (dropped.ok) failures.push('after-image --port must be flagged');

  const wrongEnv = classifyProofServerPortEnv(
    `docker run -p 7000:6300 -e MIDNIGHT_PROOF_SERVER_PORT=7000 ${LAB_IMAGE}`,
  );
  if (wrongEnv.ok) failures.push('MIDNIGHT_PROOF_SERVER_PORT must be flagged');

  const good = classifyProofServerPortEnv(
    `docker run -p 127.0.0.1:7000:7000 -e PORT=7000 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_IMAGE}`,
  );
  if (!good.ok) failures.push('PORT= form must be ok');
  if (!good.usesPortEnv) failures.push('PORT= must be detected');

  const hostOnly = classifyProofServerPortEnv(
    `docker run -p 127.0.0.1:6301:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_IMAGE}`,
  );
  if (!hostOnly.ok) failures.push('host-remap with verbose env must be ok');

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_DOCS,
    imageIssue: UPSTREAM_IMAGE,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProofServerPortEnv();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_DOCS, credit: CREDIT }, null, 2));
}
