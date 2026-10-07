import assert from 'node:assert/strict';
import test from 'node:test';
import { selectProvePath } from '../src/prove-path.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('Lace without getProvingProvider falls back to httpClientProofProvider', () => {
  const result = selectProvePath({ api: {}, prefer: 'delegated' });
  assert.equal(result.ok, true);
  assert.equal(result.fellBack, true);
  assert.equal(result.topology, 'local-proof-server');
  assert.equal(result.method, 'httpClientProofProvider');
  assert.equal(result.proofServerUrl, 'http://localhost:6300');
  assert.match(result.note, /getProvingProvider/);
  assert.match(result.upstream, /midnight-docs\/issues\/1383/);
});

test('a wallet that exposes getProvingProvider stays delegated', () => {
  const result = selectProvePath({
    api: { getProvingProvider() {} },
    prefer: 'delegated',
  });
  assert.equal(result.ok, true);
  assert.equal(result.fellBack, false);
  assert.equal(result.topology, 'wallet-delegated');
  assert.equal(result.method, 'getProvingProvider');
});

test('an indexer URL is not a hosted proof server', () => {
  const result = selectProvePath({
    prefer: 'hosted',
    proofServerUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  });
  assert.equal(result.ok, false);
  assert.equal(result.method, 'httpClientProofProvider');
});
