/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATRIX_PAGE_PROOF_SERVER,
  PROVE_GUIDE_IMAGE,
  classifyProofServerMatrixSkew,
} from '../src/proof-server-matrix-skew.mjs';

const GUIDE = 'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v';

test('prove-guide image is accepted and still notes the matrix page version', () => {
  const result = classifyProofServerMatrixSkew(GUIDE);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.proveGuideImage, PROVE_GUIDE_IMAGE);
  assert.equal(result.matrixPageVersion, MATRIX_PAGE_PROOF_SERVER);
  assert.equal(result.usesGuidePin, true);
  assert.match(result.notes.join(' '), /8\.1\.3/);
  assert.match(result.upstream, /midnight-docs\/issues\/1494/);
});

test('matrix page 8.1.3 is labeled as skew against the prove guide pin', () => {
  const result = classifyProofServerMatrixSkew(
    'Proof server 8.1.3 Handles ZKP proof generation',
  );
  assert.equal(result.ok, true);
  assert.equal(result.usesMatrixPage, true);
  assert.equal(result.usesGuidePin, false);
  assert.match(result.notes.join(' '), /midnightntwrk\/proof-server:8\.1\.0/);
});

test('toolkit container and midnight-node github field do not resolve', () => {
  const result = classifyProofServerMatrixSkew(
    'proof-server github: midnightntwrk/midnight-node container: docker.io/midnightntwrk/midnight-node-toolkit tag: proof-server-8.1.0',
  );
  assert.equal(result.ok, false);
  assert.equal(result.usesToolkit, true);
  assert.match(result.failures.join(' '), /midnight-node-toolkit/);
  assert.match(result.failures.join(' '), /midnight-ledger/);
  assert.match(result.notes.join(' '), /proof-server-8\.1\.0/);
});
