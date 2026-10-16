/**
 * Flag a config that still points at the retired testnet-02 network.
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1172
 *
 * Does not resolve hosts, does not invent endpoints, and does not claim
 * the public indexer or node is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1172';
export const OFFICIAL = 'https://docs.midnight.network/guides/networks-and-environments';

export const DOCUMENTED_NETWORK_IDS = ['undeployed', 'preview', 'preprod', 'mainnet'];
export const RETIRED_HOST_MARKERS = [
  'testnet-02.midnight.network',
  'rpc.testnet-02',
  'indexer.testnet-02',
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function mentionsRetired(value) {
  const text = String(value || '').toLowerCase();
  if (!text) return false;
  if (text === 'testnet-02' || text === 'testnet02') return true;
  return RETIRED_HOST_MARKERS.some((marker) => text.includes(marker));
}

/**
 * @param {{
 *   networkId?: string,
 *   node?: string,
 *   indexer?: string,
 *   urls?: string[],
 * }} config
 */
export function classifyTestnet02Config(config = {}) {
  const hits = [];
  if (mentionsRetired(config.networkId)) {
    hits.push({ field: 'networkId', value: String(config.networkId) });
  }
  for (const field of ['node', 'indexer']) {
    if (mentionsRetired(config[field])) {
      hits.push({ field, value: String(config[field]) });
    }
  }
  for (const url of config.urls || []) {
    if (mentionsRetired(url)) hits.push({ field: 'urls', value: String(url) });
  }
  const networkId = config.networkId ? String(config.networkId) : '';
  const known = DOCUMENTED_NETWORK_IDS.includes(networkId);
  return {
    ok: hits.length === 0 && (networkId === '' || known),
    classification: hits.length ? 'retired-testnet-02' : 'no-testnet-02',
    hits,
    documentedNetworkIds: DOCUMENTED_NETWORK_IDS,
    upstream: UPSTREAM,
    official: OFFICIAL,
    claim: 'source/config scan only — does not resolve hosts or fix the public indexer/node',
    credit: CREDIT,
    hint: hits.length
      ? 'Official networks guide says testnet-02 is retired. Its hosts no longer resolve. Use preview or preprod (or undeployed / mainnet) from that page.'
      : 'No testnet-02 marker in the supplied fields.',
  };
}

export const testnet02Credit = CREDIT;

if (import.meta.url === `file://${process.argv[1]}`) {
  const samples = [
    { networkId: 'preprod', node: 'https://rpc.midnight-preprod.blockfrost.io' },
    { networkId: 'testnet-02', node: 'https://rpc.testnet-02.midnight.network' },
    { urls: ['https://indexer.testnet-02.midnight.network/api/v4/graphql'] },
  ];
  for (const sample of samples) {
    const result = classifyTestnet02Config(sample);
    console.log(JSON.stringify({ sample, classification: result.classification, ok: result.ok }, null, 2));
  }
}
