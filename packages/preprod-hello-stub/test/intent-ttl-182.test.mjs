import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPreprodIntentTtl, decodePreprodIntentTtl } from '../src/intent-ttl-182.mjs';

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

test('preprod 182 stays the 1.0.x TTL name', () => {
  const result = checkPreprodIntentTtl();
  assert.equal(result.ok, true, result.failures.join('; '));
  const ttl = decodePreprodIntentTtl('RpcError: 1010: Invalid Transaction: Custom error: 182');
  assert.equal(ttl.applies2xRenumber, false);
  assert.match(ttl.hint, /Do not remap 182 to 228-230/);
});
