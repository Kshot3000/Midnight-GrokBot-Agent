/**
 * Local checks for the documented prove-path keys/circuit phrase.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1377
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyProveKeyMismatch, DOCUMENTED_FIX } from '../src/prove-key-mismatch.mjs';

test('names the documented keys/circuit phrase as a prove-path mismatch', () => {
  const decoded = classifyProveKeyMismatch(
    'Error: proof verification failed; check that your keys match the circuit',
  );
  assert.equal(decoded.kind, 'key-mismatch');
  assert.equal(decoded.keyMismatch, true);
  assert.equal(decoded.fix, DOCUMENTED_FIX);
  assert.equal(decoded.proofServerPin, '8.1.0');
});

test('does not treat ECONNREFUSED as a key mismatch', () => {
  const decoded = classifyProveKeyMismatch('Error: connect ECONNREFUSED 127.0.0.1:6300');
  assert.equal(decoded.kind, 'unreachable');
  assert.equal(decoded.keyMismatch, false);
  assert.equal(decoded.fix, null);
});

test('does not treat a Compact assert or a 1010 submission as a key mismatch', () => {
  const asserted = classifyProveKeyMismatch("Error: failed assert: counter must stay below the bound");
  assert.equal(asserted.kind, 'compact-assert');
  const submission = classifyProveKeyMismatch(
    'Transaction submission error: 1010: Invalid Transaction: Transaction would exhaust the block limits',
  );
  assert.equal(submission.kind, 'submission');
  assert.equal(submission.keyMismatch, false);
});
