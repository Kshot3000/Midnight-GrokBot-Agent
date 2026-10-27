/**
 * proving-topology-decode.mjs — classify reported prove-path error strings
 * against official Midnight docs. Does not invent APIs or call the network.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1383
 * Official:
 *   https://docs.midnight.network/guides/local-proving
 *   https://docs.midnight.network/guides/run-proof-server
 *   https://docs.midnight.network/guides/security-best-practices
 *   https://docs.midnight.network/api-reference/dapp-connector
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 * LOCAL-TRUE. No RPC, no proof-server call.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const OFFICIAL = {
  localProving: 'https://docs.midnight.network/guides/local-proving',
  runProofServer: 'https://docs.midnight.network/guides/run-proof-server',
  security: 'https://docs.midnight.network/guides/security-best-practices',
  connector: 'https://docs.midnight.network/api-reference/dapp-connector',
};

/**
 * Classify a reported error message or missing-method string.
 * @param {string} raw
 * @returns {{kind: string, advice: string, docs: string[]}}
 */
export function classifyProvePathError(raw) {
  const msg = String(raw || '').toLowerCase();
  if (!msg) {
    return {
      kind: 'empty',
      advice: 'No error string supplied.',
      docs: [OFFICIAL.localProving],
    };
  }
  if (msg.includes('econnrefused') || msg.includes('6300') || msg.includes('proof server unreachable') || msg.includes('connection refused')) {
    return {
      kind: 'local-proof-server-unreachable',
      advice: 'Confirm a local proof server is running and the URI matches (default http://localhost:6300). Lace Settings → Midnight → Local. Official: run your own proof server.',
      docs: [OFFICIAL.runProofServer, OFFICIAL.localProving],
    };
  }
  if (msg.includes('getprovingprovider') || msg.includes('proverserveruri')) {
    return {
      kind: 'wallet-delegated-gap',
      advice: 'Feature-detect typeof api.getProvingProvider === "function" before calling. Fall back to a local proof server. proverServerUri is deprecated (planned removal in 5.0.0).',
      docs: [OFFICIAL.connector, OFFICIAL.localProving],
    };
  }
  if (msg.includes('hosted') || msg.includes('third-party') || msg.includes('remote proof')) {
    return {
      kind: 'hosted-not-recommended',
      advice: 'Official security guidance: access only a local proof server or one on a machine you control over an encrypted channel. Witness data is visible to the proof server.',
      docs: [OFFICIAL.security, OFFICIAL.runProofServer],
    };
  }
  return {
    kind: 'unknown',
    advice: 'See official local-proving and security pages. Do not send witnesses to an untrusted proof server.',
    docs: [OFFICIAL.localProving, OFFICIAL.security],
  };
}

export const PROVING_TOPOLOGY_DOCS = OFFICIAL;
