/**
 * Recommend a proof-server start command that actually applies flags
 * and survives a short key-source outage better.
 * The image entrypoint drops arguments after the image name (servicedesk#242,
 * midnight-docs#1527). Use environment variables instead.
 * The same issue notes that a brief key-download failure exits the process
 * after three attempts; a volume at /.cache/midnight keeps completed files.
 * Does not run Docker, does not contact a proof server, and does not invent APIs.
 * Lab pin: midnightntwrk/proof-server:8.1.0
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Docs: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Official: https://docs.midnight.network/guides/local-proving
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_SERVICE_DESK = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const UPSTREAM_DOCS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const OFFICIAL = 'https://docs.midnight.network/guides/local-proving';

export const PROOF_SERVER_PIN = '8.1.0';
export const PROOF_SERVER_IMAGE = `midnightntwrk/proof-server:${PROOF_SERVER_PIN}`;

export const RECOMMENDED_DOCKER =
  `docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true -v midnight-zk-params:/.cache/midnight ${PROOF_SERVER_IMAGE}`;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Return the recommended docker command that enables verbose logging via env
 * and mounts a cache volume so completed key files survive a restart.
 * Does not invent new flags.
 */
export function recommendProvePathCommand() {
  return {
    command: RECOMMENDED_DOCKER,
    image: PROOF_SERVER_IMAGE,
    pin: PROOF_SERVER_PIN,
    note: 'Use -e MIDNIGHT_PROOF_SERVER_VERBOSE=true. Do not pass -v or other flags after the image name; the entrypoint (bash -c) drops them. Mount -v midnight-zk-params:/.cache/midnight so a short key-source outage does not force a full re-download (servicedesk#242).',
    upstream: UPSTREAM_SERVICE_DESK,
    docs: UPSTREAM_DOCS,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

/**
 * Self-check.
 */
export function checkProvePathRecommended() {
  const rec = recommendProvePathCommand();
  const failures = [];
  if (!rec.command.includes('MIDNIGHT_PROOF_SERVER_VERBOSE=true')) {
    failures.push('must use env for verbose');
  }
  if (rec.command.includes('midnight-proof-server -v')) {
    failures.push('must not use dropped -v form');
  }
  if (!rec.command.includes('/.cache/midnight')) {
    failures.push('must mount cache volume for key-download resilience');
  }
  if (!rec.command.includes(PROOF_SERVER_IMAGE)) {
    failures.push('must pin the lab image');
  }
  return {
    ok: failures.length === 0,
    failures,
    recommended: rec.command,
    upstream: UPSTREAM_SERVICE_DESK,
    docs: UPSTREAM_DOCS,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProvePathRecommended();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, command: result.recommended, credit: CREDIT }, null, 2));
}
