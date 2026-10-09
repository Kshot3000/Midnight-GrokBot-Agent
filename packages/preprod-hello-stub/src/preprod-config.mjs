/**
 * Preprod endpoints from the networks guide.
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1504
 *
 * Midnight-hosted Preprod indexer and RPC shut down from 22:00 UTC on 9 October 2026.
 * Blockfrost is the documented replacement. This module does not call those hosts
 * and does not claim the public indexer or node is fixed.
 * Proof server stays local — it sees witness data in the clear.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PREPROD_HOSTS = 'https://github.com/midnightntwrk/midnight-docs/issues/1504';
export const OFFICIAL_NETWORKS = 'https://docs.midnight.network/guides/networks-and-environments';

/** Hosts the networks guide says shut down from 22:00 UTC on 9 October 2026. */
export const RETIRED_PREPROD_HOSTS = Object.freeze({
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
});

/** Bases from the Preprod Blockfrost table. Token is appended, never stored here. */
export const BLOCKFROST_PREPROD = Object.freeze({
  node: 'https://rpc.midnight-preprod.blockfrost.io',
  nodeWS: 'wss://rpc.midnight-preprod.blockfrost.io',
  indexer: 'https://midnight-preprod.blockfrost.io/api/v0',
  indexerWS: 'wss://midnight-preprod.blockfrost.io/api/v0/ws',
  tokenPrefix: 'nightpreprod',
});

export const PREPROD = Object.freeze({
  networkId: 'preprod',
  indexer: BLOCKFROST_PREPROD.indexer,
  indexerWS: BLOCKFROST_PREPROD.indexerWS,
  node: BLOCKFROST_PREPROD.node,
  nodeWS: BLOCKFROST_PREPROD.nodeWS,
  proofServer: 'http://127.0.0.1:6300',
  proofServerImage: 'midnightntwrk/proof-server:8.1.0',
  /** Canonical faucet from Environment reference (docs). Captcha required in browser. */
  faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
  /** Alternate hostname observed serving the same preprod faucet UI. */
  faucetAlt: 'https://faucet.preprod.midnight.network/',
  /** POST /drips body uses recipientAddress + amount; needs X-Captcha-Token. */
  faucetDripsPath: '/drips',
  addressPrefixes: Object.freeze({
    unshielded: 'mn_addr_preprod',
    shielded: 'mn_shield-addr_preprod',
    dust: 'mn_dust_preprod',
  }),
  explorers: Object.freeze([
    'https://midnightexplorer.com',
    'https://midnight.subscan.io',
  ]),
  docs: Object.freeze({
    networks: OFFICIAL_NETWORKS,
    funding: 'https://docs.midnight.network/guides/acquire-tokens',
    dustProgrammatic: 'https://docs.midnight.network/guides/generating-dust-programmatically',
    deploy: 'https://docs.midnight.network/guides/deploy-mn-app',
    upstreamHosts: UPSTREAM_PREPROD_HOSTS,
  }),
});

export const BRAND = Object.freeze({
  donate:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  x: '@kshot9000',
  xUrl: 'https://x.com/kshot9000',
  nightdream: 'https://nightdream.xyz',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function withBlockfrostKey(url, projectId) {
  const token = String(projectId || '').trim();
  if (!token) return url;
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}project_id=${encodeURIComponent(token)}`;
}

export function isRetiredPreprodHost(url) {
  try {
    const host = new URL(url).hostname;
    return host === 'indexer.preprod.midnight.network' || host === 'rpc.preprod.midnight.network';
  } catch {
    return false;
  }
}

/**
 * Resolve public Preprod indexer and RPC. Does not fetch.
 * A missing token stays off the URL. A nightmainnet token is rejected.
 * Overrides that still name the retired hosts are flagged, not used as defaults.
 */
export function resolvePreprodPublicEndpoints(env = {}) {
  const failures = [];
  const token = String(env.BLOCKFROST_PROJECT_ID || '').trim();
  if (token && !token.startsWith(BLOCKFROST_PREPROD.tokenPrefix)) {
    failures.push(
      'BLOCKFROST_PROJECT_ID must be a Midnight Preprod project id (starts with nightpreprod). A mainnet token is rejected on Preprod.',
    );
  }
  const overrides = {
    indexer: env.MIDNIGHT_INDEXER_URL,
    indexerWS: env.MIDNIGHT_INDEXER_WS_URL,
    node: env.MIDNIGHT_NODE_URL,
    nodeWS: env.MIDNIGHT_NODE_WS_URL,
  };
  for (const [key, value] of Object.entries(overrides)) {
    if (value && isRetiredPreprodHost(value)) {
      failures.push(`${key} still points at a Midnight-hosted Preprod host scheduled to shut down from 22:00 UTC on 9 October 2026`);
    }
  }
  const base = {
    indexer: overrides.indexer || BLOCKFROST_PREPROD.indexer,
    indexerWS: overrides.indexerWS || BLOCKFROST_PREPROD.indexerWS,
    node: overrides.node || BLOCKFROST_PREPROD.node,
    nodeWS: overrides.nodeWS || BLOCKFROST_PREPROD.nodeWS,
  };
  const attach = token && token.startsWith(BLOCKFROST_PREPROD.tokenPrefix);
  return {
    ok: failures.length === 0,
    failures,
    networkId: 'preprod',
    indexer: attach ? withBlockfrostKey(base.indexer, token) : base.indexer,
    indexerWS: attach ? withBlockfrostKey(base.indexerWS, token) : base.indexerWS,
    node: attach ? withBlockfrostKey(base.node, token) : base.node,
    nodeWS: attach ? withBlockfrostKey(base.nodeWS, token) : base.nodeWS,
    proofServer: env.MIDNIGHT_PROOF_SERVER_URL || PREPROD.proofServer,
    tokenAttached: attach,
    tokenRequired: true,
    retired: RETIRED_PREPROD_HOSTS,
    upstream: UPSTREAM_PREPROD_HOSTS,
    official: OFFICIAL_NETWORKS,
    credit: CREDIT,
  };
}

export function redactProjectId(url) {
  return String(url).replace(/project_id=[^&]+/g, 'project_id=<redacted>');
}
