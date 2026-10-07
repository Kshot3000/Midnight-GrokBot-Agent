import assert from 'node:assert/strict';
import test from 'node:test';
import { classifySeedDeployScript } from '../src/node-seed-wallet-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

 */

const READY = `
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
setNetworkId(config.networkId);
const shielded = ZswapSecretKeys.fromSeed(keys.zswap);
const dust = DustSecretKey.fromSeed(keys.dust);
const proofServer = 'http://127.0.0.1:6300';
const synced = await wallet.waitForSyncedState();
if (!synced.isSynced) throw new Error('not synced');
await wallet.registerNightUtxosForDustGeneration(coins, key, sign);
const finalized = await wallet.finalizeRecipe(recipe);
await wallet.submitTransaction(finalized);
`;

test('a script that follows the official seed pages is ready', () => {
  const result = classifySeedDeployScript(READY);
  assert.equal(result.ready, true);
  assert.equal(result.publicIndexerFixedHere, false);
  assert.equal(result.publicNodeFixedHere, false);
  assert.match(result.upstream, /midnight-docs\/issues\/1380/);
});

test('a seed literal and a missing sync wait are gaps', () => {
  const result = classifySeedDeployScript(`
    setNetworkId('preprod');
    const seed = '0000000000000000000000000000000000000000000000000000000000000001';
    const proofServer = 'http://localhost:6300';
    await wallet.registerNightUtxosForDustGeneration(coins, key, sign);
  `);
  assert.equal(result.ready, false);
  assert.match(result.gaps.join(' '), /64-hex/);
  assert.match(result.gaps.join(' '), /sync wait/);
});

test('retired testnet-02 and a hard-coded Blockfrost id are gaps', () => {
  const result = classifySeedDeployScript(READY + `
    const indexer = 'https://indexer.testnet-02.midnight.network';
    const BLOCKFROST_PROJECT_ID = 'preprodDeadbeef';
  `);
  assert.equal(result.ready, false);
  assert.match(result.gaps.join(' '), /testnet-02/);
  assert.match(result.gaps.join(' '), /Blockfrost/);
});
