/**
 * Local checks for the bulletin-board failed-assert decoder.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  classifyProofServerStart,
  classifySampleExpectation,
  decodeFailedAssert,
} from '../src/assert-fail-decode.mjs';

const WRAPPED =
  "Found error 'Unexpected error executing scoped transaction '<unnamed>': Error: failed assert: Attempted to post to an occupied board'";

test('unwraps the example CLI failed assert', () => {
  const decoded = decodeFailedAssert(WRAPPED);
  assert.equal(decoded.ok, true);
  assert.equal(decoded.kind, 'compact-assert');
  assert.equal(decoded.scope, '<unnamed>');
  assert.equal(decoded.invariant, 'postOccupied');
  assert.equal(decoded.message, 'Attempted to post to an occupied board');
});

test('does not treat a proof-server BadInput as a Compact assert', () => {
  const decoded = decodeFailedAssert('500 with BadInput: malformed transaction data');
  assert.equal(decoded.kind, 'proof-server');
  assert.equal(decoded.proofServerError, 'BadInput');
  assert.equal(decoded.ok, false);
});

test('flags stale test-and-debug expectations from midnight-docs#1487', () => {
  const vacant = classifySampleExpectation('Board is vacant');
  assert.equal(vacant.stale, true);
  assert.equal(vacant.contractMessage, 'Attempted to take down post from an empty board');
  const owner = classifySampleExpectation('Attempted to take down post, but not the current owner');
  assert.equal(owner.ok, true);
  assert.equal(owner.stale, false);
});

test('flags the example proof-server 8.0.3 start against the 8.1.0 install pin', () => {
  const example = classifyProofServerStart(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 -- midnight-proof-server -v',
  );
  assert.equal(example.ok, false);
  const install = classifyProofServerStart(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v',
  );
  assert.equal(install.ok, true);
});
