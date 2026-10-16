import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeSubsetDeploy } from '../src/subset-deploy-decode.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('classifies a bytesWritten deploy rejection as the subset-deploy gap', () => {
  const result = decodeSubsetDeploy('Invalid Transaction: bytesWritten exceeds limit');
  assert.equal(result.isSubsetDeployGap, true);
  assert.equal(result.mentionsBytesWritten, true);
  assert.match(result.upstream, /servicedesk\/issues\/226/);
  assert.match(result.official, /deployContract/);
});

test('classifies a verifier-key maintenance mention', () => {
  const result = decodeSubsetDeploy('need multi VerifierKeyInsert in MaintenanceUpdate');
  assert.equal(result.isSubsetDeployGap, true);
  assert.equal(result.mentionsVerifierKey, true);
});

test('does not classify an unrelated CompactError', () => {
  const result = decodeSubsetDeploy('type error: expected CircuitContext');
  assert.equal(result.isSubsetDeployGap, false);
});
