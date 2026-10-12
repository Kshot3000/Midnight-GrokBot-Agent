/**
 * Local checks for the proof-provider incomplete-error decoder.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeProofProviderError, suggestProofServerBody } from '../src/proof-provider-error-decode.mjs';

test('names the dropped 400 body from servicedesk#243', () => {
  const err = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const result = decodeProofProviderError(err);
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'bad-input-dropped-body');
  assert.ok(result.notes.some((n) => n.includes('dropped the response body')));
  assert.equal(result.upstream, 'https://github.com/midnightntwrk/servicedesk/issues/243');
});

test('names the timeout reported as user abort', () => {
  const err = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
  const result = decodeProofProviderError(err, { timeoutMs: 1 });
  assert.equal(result.ok, false);
  assert.equal(result.kind, 'timeout-as-abort');
  assert.ok(result.notes.some((n) => /timeout/.test(n)));
});

test('suggests the 9.x ZKIR reason when body is provided', () => {
  const suggested = suggestProofServerBody('Bad Request', "bad input: `couldn't find built-in key increment`");
  assert.ok(suggested.includes("couldn't find built-in key"));
});

test('suggests Job Queue full', () => {
  const suggested = suggestProofServerBody('Bad Request', 'Job Queue full');
  assert.ok(/Job Queue full/i.test(suggested));
});
