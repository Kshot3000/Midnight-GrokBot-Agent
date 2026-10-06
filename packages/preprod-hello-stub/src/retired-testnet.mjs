/**
 * Refuse retired testnet-02 hostnames before a Preprod script dials them.
 *
 * Official docs: testnet-02 is retired. rpc.testnet-02.midnight.network and
 * indexer.testnet-02.midnight.network no longer resolve. Use preview or
 * preprod from the environment reference.
 * https://docs.midnight.network/guides/networks-and-environments
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1172
 * This lab does not restore those hostnames and does not change the public node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1172';
export const DOCS =
  'https://docs.midnight.network/guides/networks-and-environments';

const RETIRED_HOST = /testnet-02\.midnight\.network/i;

/** Endpoints copied from the environment reference and its verification sample. */
export const CURRENT_PUBLIC = Object.freeze({
  preview: Object.freeze({
    node: 'https://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  }),
  preprod: Object.freeze({
    node: 'https://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  }),
});

export function classifyRetiredEndpoint(value) {
  const text = value == null ? '' : String(value);
  if (!RETIRED_HOST.test(text)) return null;
  return {
    retired: true,
    host: 'testnet-02.midnight.network',
    title: 'testnet-02 is retired; that hostname does not resolve',
    hint:
      'Replace rpc.testnet-02.midnight.network and indexer.testnet-02.midnight.network with preview or preprod from the environment reference. An ENOTFOUND on testnet-02 is the retired network, not a Preprod outage. This lab does not restore the hostname.',
    docs: DOCS,
    upstream: UPSTREAM_ISSUE,
    replacement: CURRENT_PUBLIC,
  };
}

const URL_KEYS = [
  'MIDNIGHT_INDEXER_URL',
  'MIDNIGHT_INDEXER_WS_URL',
  'MIDNIGHT_NODE_URL',
  'MIDNIGHT_NODE_WS_URL',
  'MIDNIGHT_FAUCET_URL',
];

export function findRetiredEndpointConfig(env = process.env) {
  const hits = [];
  for (const key of URL_KEYS) {
    const classified = classifyRetiredEndpoint(env[key]);
    if (classified) hits.push({ key, ...classified });
  }
  return hits;
}

export function assertNoRetiredTestnet(env = process.env) {
  const hits = findRetiredEndpointConfig(env);
  if (hits.length === 0) return hits;
  const keys = hits.map((hit) => hit.key).join(', ');
  const error = new Error(
    `Retired testnet-02 endpoint in ${keys}. Use preview or preprod (${DOCS}). Upstream ${UPSTREAM_ISSUE}.`,
  );
  error.code = 'RETIRED_TESTNET_02';
  error.hits = hits;
  throw error;
}
