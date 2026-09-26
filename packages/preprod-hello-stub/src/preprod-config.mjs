/**
 * Official Preprod endpoints (from Midnight docs / midnight-js network guide).
 * Setting network id here does NOT deploy anything.
 * Proof server stays local — it sees witness data in the clear.
 */
export const PREPROD = Object.freeze({
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  proofServerImage: 'midnightntwrk/proof-server:8.1.0',
});
