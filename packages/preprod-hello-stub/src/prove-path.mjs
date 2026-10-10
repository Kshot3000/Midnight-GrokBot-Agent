/**
 * Prove-path selector for the lab. Does not call a wallet or a proof server.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1383
 * Flags dropped: https://github.com/midnightntwrk/servicedesk/issues/242
 * Docs: https://github.com/midnightntwrk/midnight-docs/issues/1527
 * Official: https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
 * Official start: https://docs.midnight.network/getting-started/installation
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROVE_PATH = 'https://github.com/midnightntwrk/midnight-docs/issues/1383';
export const UPSTREAM_FLAGS_DROPPED = 'https://github.com/midnightntwrk/servicedesk/issues/242';
export const UPSTREAM_DOCS_FLAGS = 'https://github.com/midnightntwrk/midnight-docs/issues/1527';
export const OFFICIAL_PROVE_PATH =
  'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration';
export const OFFICIAL_PROOF_SERVER_START =
  'https://docs.midnight.network/getting-started/installation';

export const LOCAL_PROOF_SERVER = 'http://localhost:6300';
export const PROOF_SERVER_IMAGE = 'midnightntwrk/proof-server:8.1.0';
export const CONNECTOR_API = '4.0.1';
export const DEPRECATED_PROVER_FIELD = 'Configuration.proverServerUri';

/** Working start: env var, no args after the image (servicedesk#242 / midnight-docs#1527). */
export const WORKING_PROOF_SERVER_START =
  `docker run -p 6300:6300 -e MIDNIGHT_PROOF_SERVER_VERBOSE=true ${PROOF_SERVER_IMAGE}`;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function isLocalProofUrl(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return (
      (host === 'localhost' || host === '127.0.0.1' || host === '::1') &&
      (parsed.protocol === 'http:' || parsed.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

/**
 * A hosted prover is only a machine the caller controls, over TLS.
 * GraphQL indexer URLs are not proof servers. This does not contact them.
 */
function isCallerControlledHttps(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    if (parsed.pathname.includes('graphql')) return false;
    if (/indexer/i.test(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Choose a documented prove path.
 * @param {{ api?: { getProvingProvider?: unknown }, proofServerUrl?: string, prefer?: 'local' | 'delegated' | 'hosted' }} [input]
 */
export function selectProvePath(input = {}) {
  const api = input.api || null;
  const hasDelegate = !!api && typeof api.getProvingProvider === 'function';
  const prefer = input.prefer || (hasDelegate ? 'delegated' : 'local');
  const configured = input.proofServerUrl || LOCAL_PROOF_SERVER;
  const failures = [];

  if (prefer === 'delegated') {
    if (hasDelegate) {
      return {
        ok: true,
        failures,
        fellBack: false,
        topology: 'wallet-delegated',
        method: 'getProvingProvider',
        proofServerUrl: null,
        deprecated: DEPRECATED_PROVER_FIELD,
        connector: CONNECTOR_API,
        proofServer: PROOF_SERVER_IMAGE,
        upstream: UPSTREAM_PROVE_PATH,
        official: OFFICIAL_PROVE_PATH,
        credit: CREDIT,
      };
    }
    // Lace and most wallets do not expose getProvingProvider (DApp Connector 4.0.1).
    // Fall back to the documented local proof server path.
    // Use the env-var form so -v is not silently dropped (servicedesk#242).
    return {
      ok: true,
      failures: [],
      fellBack: true,
      note: 'wallet-delegated proving needs ConnectedAPI.getProvingProvider (DApp Connector 4.0.1). Lace does not expose it; fall back to the local proof server.',
      topology: 'local-proof-server',
      method: 'httpClientProofProvider',
      proofServerUrl: LOCAL_PROOF_SERVER,
      start: WORKING_PROOF_SERVER_START,
      flagsNote: 'Do not pass midnight-proof-server -v after the image; the entrypoint drops it. Use MIDNIGHT_PROOF_SERVER_VERBOSE=true.',
      deprecated: DEPRECATED_PROVER_FIELD,
      connector: CONNECTOR_API,
      proofServer: PROOF_SERVER_IMAGE,
      upstream: UPSTREAM_PROVE_PATH,
      flagsDropped: UPSTREAM_FLAGS_DROPPED,
      official: OFFICIAL_PROVE_PATH,
      credit: CREDIT,
    };
  }

  if (prefer === 'hosted') {
    if (!isCallerControlledHttps(configured)) {
      failures.push(
        'a hosted proof server must be an https URL on a machine you control. Do not send witness data to an indexer GraphQL endpoint.',
      );
    }
    return {
      ok: failures.length === 0,
      failures,
      topology: 'hosted-proof-server',
      method: 'httpClientProofProvider',
      proofServerUrl: configured,
      deprecated: DEPRECATED_PROVER_FIELD,
      connector: CONNECTOR_API,
      proofServer: PROOF_SERVER_IMAGE,
      upstream: UPSTREAM_PROVE_PATH,
      official: OFFICIAL_PROOF_SERVER_START,
      credit: CREDIT,
    };
  }

  if (!isLocalProofUrl(configured)) {
    failures.push(
      `local proving must target localhost (documented default ${LOCAL_PROOF_SERVER}), not ${configured}`,
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    topology: 'local-proof-server',
    method: 'httpClientProofProvider',
    proofServerUrl: configured,
    start: WORKING_PROOF_SERVER_START,
    flagsNote: 'Do not pass midnight-proof-server -v after the image; the entrypoint drops it. Use MIDNIGHT_PROOF_SERVER_VERBOSE=true.',
    deprecated: DEPRECATED_PROVER_FIELD,
    connector: CONNECTOR_API,
    proofServer: PROOF_SERVER_IMAGE,
    upstream: UPSTREAM_PROVE_PATH,
    flagsDropped: UPSTREAM_FLAGS_DROPPED,
    official: OFFICIAL_PROOF_SERVER_START,
    credit: CREDIT,
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const lace = selectProvePath({ api: {}, prefer: 'delegated' });
  const oneAm = selectProvePath({ api: { getProvingProvider() {} }, prefer: 'delegated' });
  const badHost = selectProvePath({
    prefer: 'hosted',
    proofServerUrl: 'https://indexer.example/api/v4/graphql',
  });
  const ok = lace.ok && lace.fellBack === true && lace.topology === 'local-proof-server' && lace.method === 'httpClientProofProvider'
    && lace.start.includes('MIDNIGHT_PROOF_SERVER_VERBOSE=true') && !lace.start.includes('midnight-proof-server -v')
    && oneAm.ok && oneAm.fellBack === false && oneAm.topology === 'wallet-delegated'
    && !badHost.ok && badHost.method === 'httpClientProofProvider';
  if (!ok) {
    console.error(JSON.stringify({ lace, oneAm, badHost }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, lace: lace.topology, oneAm: oneAm.topology, hostedIndexerRejected: true, startUsesEnv: true, credit: CREDIT }, null, 2));
}
