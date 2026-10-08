/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkSubmitPrintPath, classifySubmitPrint } from '../src/submit-print-path.mjs';

test('wallet submit hides 1010 in message but not in String(err)', () => {
  const result = checkSubmitPrintPath();
  assert.equal(result.ok, true, result.failures.join('; '));
  const decoded = classifySubmitPrint({
    message: 'Transaction submission error',
    printed: '1010: Invalid Transaction: Transaction would exhaust the block limits',
    json: '{}',
    cause: undefined,
  });
  assert.equal(decoded.kind, 'wallet-string-only');
  assert.equal(decoded.messageHasReason, false);
  assert.equal(decoded.printedHasReason, true);
});
