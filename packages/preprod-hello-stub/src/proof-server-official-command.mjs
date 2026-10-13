/**
 * Classify the exact docker / Compose forms still published on the official local-proving page.
 * Does not run Docker, does not contact a proof server, and does not invent an API.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Related: https://github.com/midnightntwrk/servicedesk/issues/242
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_DOCS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const UPSTREAM_IMAGE = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const OFFICIAL_LOCAL = 'https://docs.midnight.network/guides/local-proving';

export const LAB_IMAGE = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Exact snippets from the official local-proving page that drop flags. */
export const OFFICIAL_DROPPED_DOCKER =
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v';
export const OFFICIAL_DROPPED_COMPOSE =
  "command: ['midnight-proof-server', '-v']";

/**
 * @param {string} command
 */
export function classifyOfficialCommand(command) {
  const raw = String(command || '').trim();
  const isOfficialDocker = raw === OFFICIAL_DROPPED_DOCKER;
  const isOfficialCompose = raw === OFFICIAL_DROPPED_COMPOSE;
  const usesEnvVerbose =
    /-e\s+MIDNIGHT_PROOF_SERVER_VERBOSE=true/.test(raw) ||
    /MIDNIGHT_PROOF_SERVER_VERBOSE:\s*['"]?true/.test(raw);
  const dropsFlags = isOfficialDocker || isOfficialCompose;

  return {
    ok: !dropsFlags || usesEnvVerbose,
    dropsFlags,
    isOfficialDocker,
    isOfficialCompose,
    usesEnvVerbose,
    hint: dropsFlags
      ? 'This is the form still published on docs.midnight.network/guides/local-proving. Flags after the image name are dropped (midnight-docs#1527 / servicedesk#242). Use -e MIDNIGHT_PROOF_SERVER_VERBOSE=true and give no command.'
      : usesEnvVerbose
        ? 'Env-var form reaches the binary. Matches the suggested fix.'
        : 'Not one of the two official dropped-flag snippets.',
    upstream: UPSTREAM_DOCS,
    imageIssue: UPSTREAM_IMAGE,
    official: OFFICIAL_LOCAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const badDocker = classifyOfficialCommand(OFFICIAL_DROPPED_DOCKER);
  const badCompose = classifyOfficialCommand(OFFICIAL_DROPPED_COMPOSE);
  const good = classifyOfficialCommand(
    `docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_IMAGE}`,
  );
  const ok =
    badDocker.dropsFlags &&
    !badDocker.ok &&
    badCompose.dropsFlags &&
    !badCompose.ok &&
    good.ok &&
    good.usesEnvVerbose;
  if (!ok) {
    console.error(JSON.stringify({ badDocker, badCompose, good }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_DOCS, credit: CREDIT }, null, 2));
}
