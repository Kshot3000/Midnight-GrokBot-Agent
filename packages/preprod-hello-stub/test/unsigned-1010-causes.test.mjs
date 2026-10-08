/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkUnsigned1010Causes, classifyUnsigned1010 } from '../src/unsigned-1010-causes.mjs';

test('no-inner-u8 1010 is not a signed-extrinsic cause', () => {
  const result = checkUnsigned1010Causes();
  assert.equal(result.ok, true, result.failures.join('; '));
  const decoded = classifyUnsigned1010('1010: Invalid Transaction: Transaction would exhaust the block limits');
  assert.equal(decoded.kind, 'block-limit-no-u8');
  assert.equal(decoded.ledgerCode, null);
  assert.equal(decoded.appliesSignedExtrinsicCauses, false);
});
