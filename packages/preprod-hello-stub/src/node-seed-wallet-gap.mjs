/**
 * Classify a Node seed-to-deploy script against the official wallet pages.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1380
 * https://docs.midnight.network/guides/acquire-tokens
 * https://docs.midnight.network/guides/generating-dust-programmatically
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

 */

export const UPSTREAM_NODE_SEED_GUIDE = 'https://github.com/midnightntwrk/midnight-docs/issues/1380';
export const OFFICIAL_SEED_PAGE = 'https://docs.midnight.network/guides/acquire-tokens';
export const OFFICIAL_DUST_PAGE = 'https://docs.midnight.network/guides/generating-dust-programmatically';

/** Names that appear on the official pages. Not a new SDK. */
export const DOCUMENTED_STEPS = [
  'setNetworkId',
  'ZswapSecretKeys.fromSeed',
  'DustSecretKey.fromSeed',
  'isSynced',
  'waitForSyncedState',
  'registerNightUtxosForDustGeneration',
  'finalizeRecipe',
  'submitTransaction',
];

const HEX_SEED = /['"`][0-9a-fA-F]{64}['"`]/;

export function classifySeedDeployScript(source) {
  const text = String(source ?? '');
  const gaps = [];
  if (!/setNetworkId\s*\(/.test(text)) {
    gaps.push('missing setNetworkId before wallet construction');
  }
  if (!/isSynced|waitForSyncedState|waitForSync\s*\(/.test(text)) {
    gaps.push('missing a sync wait (isSynced or waitForSyncedState)');
  }
  if (!/registerNightUtxosForDustGeneration|registerForDustGeneration/.test(text)) {
    gaps.push('missing NIGHT-for-DUST registration before a proving deploy');
  }
  if (!/localhost:6300|127\.0\.0\.1:6300/.test(text)) {
    gaps.push('proof server is not pinned to local port 6300 (proof-server 8.1.0)');
  }
  if (HEX_SEED.test(text)) {
    gaps.push('64-hex literal looks like a seed; keep it out of source');
  }
  if (/BLOCKFROST_PROJECT_ID\s*=\s*['"][^'"]+['"]/.test(text)) {
    gaps.push('Blockfrost project id is hard-coded');
  }
  if (/testnet-02|indexer\.testnet-02/.test(text)) {
    gaps.push('retired testnet-02 host');
  }
  return {
    ready: gaps.length === 0,
    gaps,
    documentedSteps: DOCUMENTED_STEPS,
    upstream: UPSTREAM_NODE_SEED_GUIDE,
    official: [OFFICIAL_SEED_PAGE, OFFICIAL_DUST_PAGE],
    publicIndexerFixedHere: false,
    publicNodeFixedHere: false,
  };
}
