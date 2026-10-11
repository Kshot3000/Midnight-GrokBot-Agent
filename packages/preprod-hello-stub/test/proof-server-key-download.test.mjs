import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkProofServerKeyDownload,
  classifyProofServerKeyDownload,
  RECOMMENDED_VOLUME,
} from '../src/proof-server-key-download.mjs';

test('proof-server key-download classifier matches servicedesk#242', () => {
  const result = checkProofServerKeyDownload();
  assert.equal(result.ok, true, result.failures.join('; '));

  const exit = classifyProofServerKeyDownload(
    'Failed to fetch data from https://srs.midnight.network/bls_midnight_2p15 after 3 attempts. Giving up.',
  );
  assert.equal(exit.ok, false);
  assert.equal(exit.kind, 'key-download-exit');
  assert.ok(exit.recommendedVolume.includes('/.cache/midnight'));
  assert.equal(exit.recommendedVolume, RECOMMENDED_VOLUME);

  const reset = classifyProofServerKeyDownload('Error: read ECONNRESET');
  assert.equal(reset.ok, false);
  assert.equal(reset.kind, 'port-not-ready');
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
