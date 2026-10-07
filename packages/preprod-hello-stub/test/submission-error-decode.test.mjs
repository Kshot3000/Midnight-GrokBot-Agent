/**
 * Local checks for the submission-error decoder.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/225
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1385
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeSubmissionError, NAMED_LEDGER_VARIANTS } from '../src/submission-error-decode.mjs';

test('names the block-limit sentence hidden by the submission wrapper', () => {
  const decoded = decodeSubmissionError(
    '(FiberFailure) SubmissionError: Transaction submission error: Transaction would exhaust the block limits',
  );
  assert.equal(decoded.ok, true);
  assert.equal(decoded.classification, 'block-limit-text-hidden');
  assert.equal(decoded.code, null);
  assert.match(decoded.hint, /servicedesk#225/);
  assert.match(decoded.hint, /154 BlockLimitExceededError/);
});

test('maps Custom error 154 to the official BlockLimitExceededError name', () => {
  const decoded = decodeSubmissionError('1010: Invalid Transaction: Custom error: 154');
  assert.equal(decoded.classification, 'named-ledger-variant');
  assert.equal(decoded.variant, 'BlockLimitExceededError');
  assert.equal(NAMED_LEDGER_VARIANTS[155], 'FeeCalculationError');
});

test('does not invent a name for unlisted submission code 10999', () => {
  const decoded = decodeSubmissionError('JSON-RPC submission layer returned 10999');
  assert.equal(decoded.classification, 'unlisted-submission-code');
  assert.equal(decoded.variant, null);
  assert.match(decoded.hint, /midnight-docs#1385/);
});

test('flags 1010 with no inner u8 as a Substrate check', () => {
  const decoded = decodeSubmissionError('1010: Invalid Transaction');
  assert.equal(decoded.classification, '1010-without-inner-u8');
});
