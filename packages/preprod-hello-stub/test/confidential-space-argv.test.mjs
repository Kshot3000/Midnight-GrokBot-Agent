/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROOF_SERVER_PIN,
  classifyConfidentialSpaceArgv,
} from '../src/confidential-space-argv.mjs';

const LOCAL = 'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v';

test('documented local proving argv is accepted', () => {
  const result = classifyConfidentialSpaceArgv(LOCAL);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.pin, PROOF_SERVER_PIN);
  assert.equal(result.port, 6300);
  assert.equal(result.documentedFlags.includes('--no-fetch-params'), true);
  assert.equal(result.documentedEnv.includes('MIDNIGHT_PROOF_SERVER_PORT'), true);
});

test('Confidential Space flags are rejected and the issue stays open', () => {
  const result = classifyConfidentialSpaceArgv(
    `${LOCAL} --confidential-space --tee`,
  );
  assert.equal(result.ok, false);
  assert.equal(result.undocumented.length > 0, true);
  assert.match(result.failures.join(' '), /servicedesk#204/);
  assert.match(result.upstream, /servicedesk\/issues\/204/);
});

test('toolkit image is not the documented proof server', () => {
  const result = classifyConfidentialSpaceArgv(
    'docker run midnightntwrk/midnight-node-toolkit midnight-proof-server',
  );
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /midnightntwrk\/proof-server/);
});
