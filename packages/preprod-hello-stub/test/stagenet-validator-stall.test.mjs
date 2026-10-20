/**
 * Tests for Stagenet validator stall classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/264
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyStagenetContractStateError,
  STALL_PEER,
  STALL_BLOCK,
  ERROR_STRING,
} from '../src/stagenet-validator-stall.mjs';

test('reported error string is a stall candidate', () => {
  const result = classifyStagenetContractStateError(ERROR_STRING, STALL_PEER);
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'stagenet-validator-stall-candidate');
  assert.equal(result.isStallString, true);
  assert.equal(result.isKnownPeer, true);
  assert.equal(result.stalledAt, STALL_BLOCK);
});

test('unrelated message is not classified as stall', () => {
  const result = classifyStagenetContractStateError('ContractConfigurationError');
  assert.equal(result.ok, true);
  assert.equal(result.isStallString, false);
  assert.equal(result.stalledAt, null);
});

test('peer id alone is noted when present', () => {
  const result = classifyStagenetContractStateError('failed', STALL_PEER);
  assert.equal(result.isKnownPeer, true);
  assert.equal(result.isStallString, false);
});
