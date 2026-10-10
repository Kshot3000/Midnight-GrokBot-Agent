/**
 * Classify proof-server docker run / Compose forms that silently drop flags.
 * Does not run Docker, does not contact a proof server, and does not invent an API.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/242
 * Docs: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_FLAGS = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const UPSTREAM_DOCS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const OFFICIAL_LOCAL = 'https://docs.midnight.network/guides/local-proving';

export const LAB_IMAGE = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * The image entrypoint is `bash -c` with command `midnight-proof-server --port $PORT`.
 * Anything after the image name is ignored (or becomes $0 for bash -c).
 * @param {string} command
 */
export function classifyFlagsDropped(command) {
  const raw = String(command || '').trim();
  const hasImage = /midnightntwrk\/proof-server/.test(raw);
  const hasArgAfterImage = /proof-server[:\w.-]*\s+(-|midnight-proof-server|--)/.test(raw);
  const usesEnvVerbose = /-e\s+MIDNIGHT_PROOF_SERVER_VERBOSE=true/.test(raw) || /MIDNIGHT_PROOF_SERVER_VERBOSE:\s*['"]?true/.test(raw);
  const dropsFlags = hasImage && hasArgAfterImage && !usesEnvVerbose;

  return {
    ok: !dropsFlags,
    dropsFlags,
    usesEnvVerbose,
    hasImage,
    hint: dropsFlags
      ? 'Flags after the image name are dropped by the bash -c entrypoint (servicedesk#242). Use -e MIDNIGHT_PROOF_SERVER_VERBOSE=true and give no command.'
      : usesEnvVerbose
        ? 'Env-var form reaches the binary. Matches the suggested fix in midnight-docs#1527.'
        : 'No dropped-flag pattern detected.',
    upstream: UPSTREAM_FLAGS,
    docs: UPSTREAM_DOCS,
    official: OFFICIAL_LOCAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const bad = classifyFlagsDropped(`docker run -p 6300:6300 ${LAB_IMAGE} midnight-proof-server -v`);
  const good = classifyFlagsDropped(`docker run -p 6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_IMAGE}`);
  const ok = bad.dropsFlags && !bad.ok && good.ok && good.usesEnvVerbose;
  if (!ok) {
    console.error(JSON.stringify({ bad, good }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_FLAGS, credit: CREDIT }, null, 2));
}
