/**
 * Classify official proof-server start forms that drop flags (entrypoint is bash -c).
 * Does not run Docker or contact a proof server. Does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Image bug: https://github.com/midnightntwrk/servicedesk/issues/242
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
export const OFFICIAL_INSTALL = 'https://docs.midnight.network/getting-started/installation';

export const LAB_PIN = 'midnightntwrk/proof-server:8.1.0';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Exact forms still shown on the official pages as of 2026-10-14. */
export const BROKEN_OFFICIAL_FORMS = Object.freeze([
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v',
  "command: ['midnight-proof-server', '-v']",
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 -- midnight-proof-server -v',
]);

/**
 * Detect forms whose flags never reach the binary, and recommend the env form.
 * @param {string} text docker run line, Compose snippet, or full page excerpt
 */
export function classifyProofServerEnvForm(text) {
  const raw = String(text || '');
  const isBroken = BROKEN_OFFICIAL_FORMS.some((form) => raw.includes(form))
    || (/midnight-proof-server\s+-v/.test(raw) && !/-e\s+MIDNIGHT_PROOF_SERVER_VERBOSE/.test(raw))
    || (/command:\s*\[\s*['"]midnight-proof-server['"]/.test(raw));
  const usesEnv = /-e\s+MIDNIGHT_PROOF_SERVER_VERBOSE=true/.test(raw)
    || /MIDNIGHT_PROOF_SERVER_VERBOSE:\s*['"]?true/.test(raw);
  const hasLabPin = raw.includes(LAB_PIN);

  return {
    ok: usesEnv && !isBroken,
    isBroken,
    usesEnv,
    hasLabPin,
    recommended: `docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_PIN}`,
    hint: isBroken
      ? 'Official form drops -v / command because the image entrypoint is bash -c (midnight-docs#1527, servicedesk#242). Switch to the env-var form and give no command.'
      : usesEnv
        ? 'Env-var form reaches the binary. Verbose logging is on for 8.x 400 bad-input reasons.'
        : 'No known broken official form detected. Prefer -e MIDNIGHT_PROOF_SERVER_VERBOSE=true and no command args.',
    upstream: UPSTREAM_DOCS,
    image: UPSTREAM_IMAGE,
    official: OFFICIAL_LOCAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const broken = classifyProofServerEnvForm(BROKEN_OFFICIAL_FORMS[0]);
  const good = classifyProofServerEnvForm(
    `docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${LAB_PIN}`,
  );
  const ok = broken.isBroken && !broken.ok && good.ok && good.usesEnv;
  if (!ok) {
    console.error(JSON.stringify({ broken, good }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, recommended: good.recommended, credit: CREDIT }, null, 2));
}
