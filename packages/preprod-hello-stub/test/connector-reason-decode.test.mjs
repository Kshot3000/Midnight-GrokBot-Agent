import test from 'node:test';
import assert from 'node:assert/strict';
import { checkConnectorReason, decodeConnectorReason } from '../src/connector-reason-decode.mjs';

test('connector reason decoder matches official 4.0.1 APIError shape', () => {
  const result = checkConnectorReason();
  assert.equal(result.ok, true, result.failures.join('; '));
  const empty = decodeConnectorReason({
    type: 'DAppConnectorAPIError',
    code: 'Disconnected',
    reason: '',
  });
  assert.equal(empty.kind, 'connector-without-node-text');
  assert.equal(empty.ledgerCode, null);
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
