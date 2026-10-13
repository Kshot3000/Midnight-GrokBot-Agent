/**
 * Local checks for captured proof-server body classification.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyProofServerBody, UPSTREAM_BODY_REASON } from '../src/proof-server-body-reason.mjs';

test('classifies 8.x bad input', () => {
  const r = classifyProofServerBody('bad input', 400);
  assert.equal(r.kind, 'BadInput');
  assert.equal(r.official, 'WorkError.BadInput(String)');
  assert.equal(r.upstream, UPSTREAM_BODY_REASON);
});

test('classifies 9.x reason string', () => {
  const r = classifyProofServerBody("bad input: `couldn't find built-in key increment`");
  assert.equal(r.kind, 'BadInput');
  assert.ok(r.reason.includes('increment'));
});

test('classifies Job Queue full', () => {
  const r = classifyProofServerBody('Job Queue full');
  assert.equal(r.kind, 'JobQueueFull');
});

test('classifies internal error', () => {
  const r = classifyProofServerBody('internal error', 500);
  assert.equal(r.kind, 'InternalError');
});

test('unknown body', () => {
  const r = classifyProofServerBody('nope');
  assert.equal(r.kind, 'unknown-body');
});
