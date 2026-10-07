/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySeedDeployDocs, checkPublicWalletPayload, PUBLIC_CLAIM } from '../src/node-seed-deploy-gap.mjs';

const hello = 'The local devnet package comes with 3 pre-funded wallets. Run yarn test:local.';
const token = 'You pass your wallet seed in MIDNIGHT_SEED. On Preprod, fund the printed address at the faucet.';

test('hello-world is not the seed deploy guide', () => {
  const result = classifySeedDeployDocs({ helloWorldText: hello, unshieldedText: token, serverDeployGuidePresent: false });
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.match(result.gap, /not a published Node guide/);
});

test('rejects a claim that issue 1380 is filled', () => {
  const result = classifySeedDeployDocs({ helloWorldText: hello, unshieldedText: token, serverDeployGuidePresent: true });
  assert.equal(result.ok, false);
});

test('public throwaway payload stays address-only', () => {
  const ok = checkPublicWalletPayload({ claim: PUBLIC_CLAIM, addresses: { unshielded: 'mn_addr' } });
  assert.equal(ok.ok, true);
  const leaked = checkPublicWalletPayload({ claim: PUBLIC_CLAIM, mnemonic: 'abandon' });
  assert.equal(leaked.ok, false);
});
