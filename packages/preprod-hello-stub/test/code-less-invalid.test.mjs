/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkCodeLessRejection, decodeCodeLessRejection } from '../src/code-less-invalid.mjs';

test('code-less TransactionInvalidError does not invent a ledger u8', () => {
  const result = checkCodeLessRejection();
  assert.equal(result.ok, true, result.failures.join('; '));
  const decoded = decodeCodeLessRejection('TransactionInvalidError: Transaction is invalid and was rejected by the node');
  assert.equal(decoded.kind, 'code-less-drop');
  assert.equal(decoded.ledgerCode, null);
});
