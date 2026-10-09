/**
 * Classify the two official proof-server Docker forms against the lab pin.
 * Does not run Docker, does not contact a proof server, and does not invent an API.
 *
 * Official Windows form (proof-server 8.1.0, end-of-flags `--`):
 *   https://docs.midnight.network/guides/windows-compact-setup
 * Official getting-started form still shows image 8.0.3 and no `--`:
 *   https://docs.midnight.network/getting-started/installation
 * Upstream open: https://github.com/midnightntwrk/example-hello-world/issues/13
 *   (Renovate lists midnightntwrk/proof-server 8.1.0 → 8.1.3; this lab stays on 8.1.0)
 * Closed related: https://github.com/midnightntwrk/midnight-docs/issues/556
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/example-hello-world/issues/13';
export const OFFICIAL_WINDOWS = 'https://docs.midnight.network/guides/windows-compact-setup';
export const OFFICIAL_INSTALL = 'https://docs.midnight.network/getting-started/installation';
export const CLOSED_INSTALL_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/556';

/** Lab pin. Do not follow Renovate to 8.1.3 from example-hello-world#13. */
export const PROOF_SERVER_PIN = '8.1.0';
export const PROOF_SERVER_IMAGE = `midnightntwrk/proof-server:${PROOF_SERVER_PIN}`;

export const WINDOWS_ARGV =
  `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} -- midnight-proof-server -v`;
export const STALE_INSTALL_ARGV =
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 midnight-proof-server -v';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function tokens(command) {
  return String(command || '').trim().split(/\s+/).filter(Boolean);
}

/**
 * @param {string} command
 */
export function classifyProofServerArgv(command) {
  const parts = tokens(command);
  const failures = [];
  const image = parts.find((part) => part.startsWith('midnightntwrk/proof-server')) || null;
  const dashDash = parts.indexOf('--');
  const binaryAt = parts.indexOf('midnight-proof-server');
  const hasVerbose = parts.includes('-v');
  const publishedPort = parts.includes('6300:6300');

  if (!image) {
    failures.push('command has no midnightntwrk/proof-server image');
  } else if (image.endsWith(':latest') || !image.includes(':')) {
    failures.push(`do not use proof-server latest; pin ${PROOF_SERVER_IMAGE}`);
  } else if (image !== PROOF_SERVER_IMAGE) {
    failures.push(
      `${image} is not the lab pin ${PROOF_SERVER_IMAGE}. example-hello-world#13 lists 8.1.3; public docs still show 8.1.0 on the Windows page and 8.0.3 on getting-started. Stay on 8.1.0.`,
    );
  }
  if (binaryAt < 0) failures.push('command does not start midnight-proof-server');
  if (!hasVerbose) failures.push('official samples pass -v');
  if (!publishedPort) failures.push('official samples publish 6300:6300');
  if (dashDash >= 0 && binaryAt >= 0 && dashDash > binaryAt) {
    failures.push('`--` must come before midnight-proof-server (Docker end-of-flags)');
  }

  const form = image === PROOF_SERVER_IMAGE && binaryAt >= 0 && dashDash >= 0 && dashDash < binaryAt
    ? 'windows-end-of-flags'
    : image === PROOF_SERVER_IMAGE && binaryAt >= 0 && dashDash < 0
      ? 'image-then-binary'
      : 'other';

  return {
    ok: failures.length === 0 && (form === 'windows-end-of-flags' || form === 'image-then-binary'),
    failures,
    form,
    image,
    pin: PROOF_SERVER_PIN,
    windowsArgv: WINDOWS_ARGV,
    staleInstallArgv: STALE_INSTALL_ARGV,
    claim: 'local argv classification against official samples — not a proof-server, indexer, or node fix',
    upstream: UPSTREAM_ISSUE,
    official: OFFICIAL_WINDOWS,
    installPage: OFFICIAL_INSTALL,
    closedInstallIssue: CLOSED_INSTALL_ISSUE,
    credit: CREDIT,
  };
}

export const proofServerArgvCredit = CREDIT;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const windows = classifyProofServerArgv(WINDOWS_ARGV);
  const sameBinary = classifyProofServerArgv(
    `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} midnight-proof-server -v`,
  );
  const stale = classifyProofServerArgv(STALE_INSTALL_ARGV);
  const bump = classifyProofServerArgv(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.3 -- midnight-proof-server -v',
  );
  if (!windows.ok || windows.form !== 'windows-end-of-flags' || !sameBinary.ok || stale.ok || bump.ok) {
    console.error(JSON.stringify({ windows, sameBinary, stale, bump }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    ok: true,
    form: windows.form,
    pin: PROOF_SERVER_PIN,
    credit: CREDIT,
  }, null, 2));
}
