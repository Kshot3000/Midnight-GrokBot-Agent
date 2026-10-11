import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkProofServerImageFlags,
  classifyProofServerImageFlags,
  RECOMMENDED_DOCKER,
  PROOF_SERVER_IMAGE,
} from '../src/proof-server-image-flags.mjs';

test('proof-server image flag-drop classifier matches servicedesk#242 / midnight-docs#1527', () => {
  const result = checkProofServerImageFlags();
  assert.equal(result.ok, true, result.failures.join('; '));

  const dropped = classifyProofServerImageFlags(
    `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} midnight-proof-server -v`,
  );
  assert.equal(dropped.ok, false);
  assert.ok(dropped.failures.length > 0);

  const good = classifyProofServerImageFlags(RECOMMENDED_DOCKER);
  assert.equal(good.ok, true);
  assert.ok(good.recommended.includes('MIDNIGHT_PROOF_SERVER_VERBOSE=true'));
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
