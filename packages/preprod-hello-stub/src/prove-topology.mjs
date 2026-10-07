/**
 * Classify a prove path against the published local-proving guide.
 * Official: https://docs.midnight.network/guides/local-proving
 * Upstream gap: https://github.com/midnightntwrk/midnight-docs/issues/1383
 *
 * Does not call a proof server, does not invent a wallet-delegated API,
 * and does not claim the public proof server, indexer, or node is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROVE_TOPOLOGY = 'https://github.com/midnightntwrk/midnight-docs/issues/1383';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_RUN_PROOF_SERVER = 'https://docs.midnight.network/guides/run-proof-server';
export const STALE_PROOF_SERVER_PAGE = 'https://docs.midnight.network/develop/how-to/run-proof-server';
export const PROOF_SERVER_PIN = '8.1.0';
export const DOCUMENTED_LACE_PROVE_URL = 'http://localhost:6300';
export const DOCUMENTED_START =
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * @param {{
 *   proveUrl?: string,
 *   mode?: string,
 *   controlledMachine?: boolean,
 *   image?: string,
 * }} input
 */
export function classifyProveTopology(input = {}) {
  const proveUrl = input.proveUrl ? String(input.proveUrl).trim() : '';
  const mode = input.mode ? String(input.mode).trim().toLowerCase() : '';
  const image = input.image ? String(input.image).trim() : '';
  const reasons = [];
  const host = hostOf(proveUrl);
  const localHost = host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  const port6300 = /:6300(?:\/|$)/.test(proveUrl);
  const staleImage = /midnightnetwork\/proof-server/i.test(image) || /--network\s+testnet\b/i.test(image);

  if (mode === 'wallet-delegated' || mode === 'hosted' || mode === 'public-hosted') {
    return {
      kind: 'undocumented',
      accept: false,
      local: false,
      reasons: [
        'Published local-proving guide does not name a wallet-delegated or public hosted proof server.',
        'Lace documents one option: Settings, Midnight, Local, http://localhost:6300.',
        'Issue 1383 asks for that topology page. This lab does not invent the API.',
      ],
      proveUrl: DOCUMENTED_LACE_PROVE_URL,
      start: DOCUMENTED_START,
      upstream: UPSTREAM_PROVE_TOPOLOGY,
      official: OFFICIAL_LOCAL_PROVING,
      publicProofServerFixed: false,
      credit: CREDIT,
    };
  }

  if (staleImage) {
    reasons.push(`image or flag matches the stale develop page ${STALE_PROOF_SERVER_PAGE}`);
    reasons.push(`use ${DOCUMENTED_START}`);
    return {
      kind: 'stale-image',
      accept: false,
      local: false,
      reasons,
      proveUrl: DOCUMENTED_LACE_PROVE_URL,
      start: DOCUMENTED_START,
      upstream: UPSTREAM_PROVE_TOPOLOGY,
      official: OFFICIAL_LOCAL_PROVING,
      publicProofServerFixed: false,
      credit: CREDIT,
    };
  }

  if (localHost && port6300) {
    reasons.push('host is local and port is the documented 6300');
    reasons.push('proof server sees witness data and does not hold wallet keys');
    return {
      kind: 'local',
      accept: true,
      local: true,
      reasons,
      proveUrl,
      start: DOCUMENTED_START,
      upstream: UPSTREAM_PROVE_TOPOLOGY,
      official: OFFICIAL_LOCAL_PROVING,
      publicProofServerFixed: false,
      credit: CREDIT,
    };
  }

  if (input.controlledMachine === true && /^https:\/\//.test(proveUrl)) {
    reasons.push('caller marked this as a machine they control, over https');
    reasons.push('official guide allows a remote machine you control over an encrypted channel');
    return {
      kind: 'controlled-remote',
      accept: true,
      local: false,
      reasons,
      proveUrl,
      start: DOCUMENTED_START,
      upstream: UPSTREAM_PROVE_TOPOLOGY,
      official: OFFICIAL_RUN_PROOF_SERVER,
      publicProofServerFixed: false,
      credit: CREDIT,
    };
  }

  reasons.push('non-local proof URL is someone else\'s proof server unless you control that machine');
  reasons.push('do not send witness data there; Lace documents only http://localhost:6300');
  return {
    kind: 'stranger-hosted',
    accept: false,
    local: false,
    reasons,
    proveUrl: proveUrl || null,
    start: DOCUMENTED_START,
    upstream: UPSTREAM_PROVE_TOPOLOGY,
    official: OFFICIAL_LOCAL_PROVING,
    publicProofServerFixed: false,
    credit: CREDIT,
  };
}

export const builderCredit = CREDIT;
