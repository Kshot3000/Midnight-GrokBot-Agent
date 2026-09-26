/**
 * Official Preprod endpoints from Midnight docs:
 * https://docs.midnight.network/guides/networks-and-environments
 *
 * Setting network id / printing endpoints does NOT deploy anything.
 * Proof server stays local — it sees witness data in the clear.
 */
export const PREPROD = Object.freeze({
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
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
    networks: 'https://docs.midnight.network/guides/networks-and-environments',
    funding: 'https://docs.midnight.network/guides/acquire-tokens',
    dustProgrammatic: 'https://docs.midnight.network/guides/generating-dust-programmatically',
    deploy: 'https://docs.midnight.network/guides/deploy-mn-app',
  }),
});

export const BRAND = Object.freeze({
  donate:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  x: '@kshot9000',
  xUrl: 'https://x.com/kshot9000',
  nightdream: 'https://nightdream.io',
});
