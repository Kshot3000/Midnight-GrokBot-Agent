/**
 * Classify proof-server Docker/Compose forms that silently drop flags.
 * The image entrypoint is bash -c with command "midnight-proof-server --port $PORT",
 * so anything after the image name is dropped (servicedesk#242, midnight-docs#1527).
 * Does not run Docker, does not contact a proof server, and does not invent APIs.
 * Lab pin remains midnightntwrk/proof-server:8.1.0.
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

/** Recommended form that actually enables verbose logging (env, no after-image args). */
export const RECOMMENDED_DOCKER =
  `docker run -p 127.0.0.1:6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${PROOF_SERVER_IMAGE}`;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string | string[]} input docker run string or compose command array
 */
export function classifyProofServerImageFlags(input) {
  const isArray = Array.isArray(input);
  const text = isArray ? input.join(' ') : String(input || '');
  const failures = [];
  const notes = [];

  // Array form used in many compose files and docs (example-hello-world#16 swapped to this).
  if (isArray && input.length >= 2 && input[0] === 'midnight-proof-server' && input.includes('-v')) {
    failures.push(
      'compose command: [\'midnight-proof-server\', \'-v\'] is dropped by the image entrypoint (bash -c). Use environment: MIDNIGHT_PROOF_SERVER_VERBOSE: \'true\' and no command.',
    );
  }

  // Forms that pass flags after the image name (including with --).
  if (!isArray && /midnight-proof-server\s+(-v|--network|--port|--help|--no-fetch-params)/.test(text)) {
    failures.push(
      'flags after the image name (midnight-proof-server -v / --network / --port) never reach the binary. The entrypoint is bash -c "midnight-proof-server --port $PORT".',
    );
  }
  if (!isArray && /--\s+midnight-proof-server\s+(-v|--network)/.test(text)) {
    failures.push(
      'docker run IMAGE -- midnight-proof-server -v still drops the flag. Use -e MIDNIGHT_PROOF_SERVER_VERBOSE=true instead.',
    );
  }

  // --network preprod no longer exists.
  if (/--network\s+preprod/.test(text)) {
    failures.push(
      '--network preprod is dropped and the flag no longer exists (error: unexpected argument \'--network\'). Drop it.',
    );
  }

  // Working forms.
  const usesVerboseEnv = /MIDNIGHT_PROOF_SERVER_VERBOSE\s*=\s*true/i.test(text);
  const usesSingleString = /['"]midnight-proof-server\s+-v['"]/.test(text);
  if (usesVerboseEnv || usesSingleString) {
    notes.push('this form can actually enable verbose logging');
  }

  const ok = failures.length === 0 && (usesVerboseEnv || usesSingleString || /MIDNIGHT_PROOF_SERVER_VERBOSE/.test(text));

  return {
    ok,
    failures,
    notes,
    recommended: RECOMMENDED_DOCKER,
    pin: PROOF_SERVER_PIN,
    claim: 'local classification of image entrypoint behaviour — not a proof-server, indexer, or node fix',
    upstream: UPSTREAM_SERVICE_DESK,
    docs: UPSTREAM_DOCS,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkProofServerImageFlags() {
  const failures = [];
  const dropped = classifyProofServerImageFlags(
    `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} midnight-proof-server -v`,
  );
  if (dropped.ok) failures.push('after-image -v must be flagged');

  const withDash = classifyProofServerImageFlags(
    `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} -- midnight-proof-server -v`,
  );
  if (withDash.ok) failures.push('-- midnight-proof-server -v must be flagged');

  const compose = classifyProofServerImageFlags(['midnight-proof-server', '-v']);
  if (compose.ok) failures.push('compose array form must be flagged');

  const network = classifyProofServerImageFlags(
    `docker run ${PROOF_SERVER_IMAGE} -- midnight-proof-server --network preprod`,
  );
  if (network.ok) failures.push('--network preprod must be flagged');

  const good = classifyProofServerImageFlags(RECOMMENDED_DOCKER);
  if (!good.ok) failures.push('recommended env form must be ok');

  const single = classifyProofServerImageFlags(
    `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} 'midnight-proof-server -v'`,
  );
  if (!single.ok) failures.push('single-string form must be ok');

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_SERVICE_DESK,
    docs: UPSTREAM_DOCS,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProofServerImageFlags();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM_SERVICE_DESK, credit: CREDIT }, null, 2));
}
