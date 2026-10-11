import test from 'node:test';
import assert from 'node:assert/strict';
import { checkProofProviderBody, decodeProofProviderError, extractProofServerReason } from '../src/proof-provider-body-decode.mjs';

test('proof-provider body decoder matches servicedesk#243 shapes', () => {
  const result = checkProofProviderBody();
  assert.equal(result.ok, true, result.failures.join('; '));

  const dropped = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  assert.equal(dropped.bodyDropped, true);
  assert.equal(dropped.code, '400');
  assert.equal(dropped.body, null);
  assert.equal(dropped.reason, null);

  const withBody = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input: `couldn\'t find built-in key increment`"',
  );
  assert.equal(withBody.bodyDropped, false);
  assert.equal(withBody.reason, "couldn't find built-in key increment");

  const timeout = decodeProofProviderError('AbortError: The user aborted a request.');
  assert.equal(timeout.isTimeout, true);
  assert.equal(timeout.kind, 'timeout');

  assert.equal(extractProofServerReason('bad input: `Job Queue full`'), 'Job Queue full');
  assert.equal(extractProofServerReason('bad input'), 'bad input');
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
