/**
 * Midnight Preprod endpoints, env-driven.
 * https://docs.midnight.network/guides/networks-and-environments
 *
 * Midnight shut down indexer.preprod.midnight.network and rpc.preprod.midnight.network
 * on 2026-10-09 (22:00 UTC). Blockfrost now serves the same indexer GraphQL API
 * (HTTP + graphql-transport-ws) and node JSON-RPC; every request needs a
 * Blockfrost Midnight Preprod project id (starts with `nightpreprod`), appended
 * as ?project_id= because midnight.js / the wallet SDK can't set headers.
 *
 * Resolution order:
 *   1. MIDNIGHT_INDEXER_URL / MIDNIGHT_INDEXER_WS_URL / MIDNIGHT_NODE_URL (explicit)
 *   2. BLOCKFROST_MIDNIGHT_PREPROD_ID -> Blockfrost URLs
 *   3. the retired Midnight-hosted URLs (will 410; kept so offline tests import)
 *
 * PREPROD holds the real URLs (may contain the project id): never print it.
 * Print PREPROD_PUBLIC instead (same shape, project id replaced by "…").
 * Setting network id / printing endpoints does NOT deploy anything.
 * Proof server stays local — it sees witness data in the clear.
 */
export const BLOCKFROST_PREPROD = Object.freeze({
  indexer: 'https://midnight-preprod.blockfrost.io/api/v0',
  indexerWS: 'wss://midnight-preprod.blockfrost.io/api/v0/ws',
  node: 'https://rpc.midnight-preprod.blockfrost.io',
  nodeWS: 'wss://rpc.midnight-preprod.blockfrost.io',
});
const RETIRED = Object.freeze({
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
});

/** Remove any project_id query value so a URL is safe to log. */
export const redactUrl = (u) => String(u).replace(/([?&]project_id=)[^&]*/g, '$1…');

/** Resolve the Preprod indexer + node URLs from an env object. */
export function preprodEndpoints(env = process.env) {
  const id = env.BLOCKFROST_MIDNIGHT_PREPROD_ID?.trim();
  if (id && !id.startsWith('nightpreprod')) {
    throw new Error('BLOCKFROST_MIDNIGHT_PREPROD_ID must be a Midnight Preprod Blockfrost project id (starts with nightpreprod)');
  }
  const q = id ? `?project_id=${encodeURIComponent(id)}` : '';
  const base = id ? BLOCKFROST_PREPROD : RETIRED;
  const indexer = env.MIDNIGHT_INDEXER_URL?.trim() || base.indexer + q;
  const node = env.MIDNIGHT_NODE_URL?.trim() || base.node + q;
  return {
    provider: env.MIDNIGHT_INDEXER_URL?.trim() ? 'custom' : id ? 'blockfrost' : 'retired-midnight-hosted',
    indexer,
    indexerWS: env.MIDNIGHT_INDEXER_WS_URL?.trim() || (env.MIDNIGHT_INDEXER_URL?.trim() ? indexer.replace(/^http/, 'ws').replace(/(\?.*)?$/, (m) => `/ws${m}`) : base.indexerWS + q),
    node,
    nodeWS: env.MIDNIGHT_NODE_WS_URL?.trim() || node.replace(/^http/, 'ws'),
  };
}

const EP = preprodEndpoints();

const BASE = {
  networkId: 'preprod',
  proofServer: process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://127.0.0.1:6300',
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
    'https://preprod.midnightexplorer.com',
    'https://midnight-preprod.subscan.io',
  ]),
  docs: Object.freeze({
    networks: 'https://docs.midnight.network/guides/networks-and-environments',
    blockfrost: 'https://docs.blockfrost.io/midnight/',
    funding: 'https://docs.midnight.network/guides/acquire-tokens',
    dustProgrammatic: 'https://docs.midnight.network/guides/generating-dust-programmatically',
    deploy: 'https://docs.midnight.network/guides/deploy-mn-app',
  }),
};

/** Real endpoints (may embed the Blockfrost project id). Do not log. */
export const PREPROD = Object.freeze({
  ...BASE,
  provider: EP.provider,
  indexer: EP.indexer,
  indexerWS: EP.indexerWS,
  node: EP.node,
  nodeWS: EP.nodeWS,
});

/** Same as PREPROD with the project id redacted; safe to print. */
export const PREPROD_PUBLIC = Object.freeze({
  ...PREPROD,
  indexer: redactUrl(PREPROD.indexer),
  indexerWS: redactUrl(PREPROD.indexerWS),
  node: redactUrl(PREPROD.node),
  nodeWS: redactUrl(PREPROD.nodeWS),
});

export const BRAND = Object.freeze({
  donate:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  x: '@kshot9000',
  xUrl: 'https://x.com/kshot9000',
  nightdream: 'https://nightdream.io',
});
