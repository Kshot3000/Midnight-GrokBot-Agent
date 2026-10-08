/**
 * Local checks for the node 1.0.x 1010 table subset.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Official: https://docs.midnight.network/nodes/error-codes
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyNodeLine1010, classifySubmitPrint, NODE_1_0_CODES } from '../src/node-line-1010.mjs';
import { decodeSubmissionError } from '../src/submission-error-decode.mjs';

test('keeps 168 FeeCalculation live on the public 1.0.x table', () => {
  const decoded = classifyNodeLine1010(168);
  assert.equal(decoded.variant, 'FeeCalculation');
  assert.equal(decoded.retired, false);
  assert.equal(decoded.nodeLine, '1.0.x');
  assert.match(decoded.hint, /midnight-docs#1509/);
  assert.equal(NODE_1_0_CODES[196], 'DustDoubleSpend');
  assert.equal(NODE_1_0_CODES[182], 'TransactionApplicationError');
});

test('wallet message hides Custom error that String(err) still has', () => {
  const decoded = classifySubmitPrint(
    { message: 'Transaction submission error' },
    'FiberFailure SubmissionError: Transaction submission error: 1010: Invalid Transaction: Custom error: 182',
  );
  assert.equal(decoded.classification, 'wallet-message-hides-code');
  assert.equal(decoded.appliesSignedExtrinsicCauses, false);
  assert.match(decoded.hint, /signAndSend/);
});

test('submission decoder no longer marks 168 retired', () => {
  const decoded = decodeSubmissionError('1010: Invalid Transaction: Custom error: 168');
  assert.equal(decoded.variant, 'FeeCalculation');
  assert.equal(decoded.retired, false);
  assert.match(decoded.hint, /1\.0\.x/);
});
