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
  STALE_INSTALL_ARGV,
  WINDOWS_ARGV,
  classifyProofServerArgv,
} from '../src/proof-server-argv.mjs';

test('Windows Compact setup argv is the pinned 8.1.0 form', () => {
  const result = classifyProofServerArgv(WINDOWS_ARGV);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.form, 'windows-end-of-flags');
  assert.equal(result.pin, PROOF_SERVER_PIN);
  assert.equal(result.official.includes('windows-compact-setup'), true);
});

test('image then binary is accepted when the image is 8.1.0', () => {
  const result = classifyProofServerArgv(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v',
  );
  assert.equal(result.ok, true);
  assert.equal(result.form, 'image-then-binary');
});

test('getting-started 8.0.3 and Renovate 8.1.3 are rejected', () => {
  const stale = classifyProofServerArgv(STALE_INSTALL_ARGV);
  const bump = classifyProofServerArgv(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.3 -- midnight-proof-server -v',
  );
  assert.equal(stale.ok, false);
  assert.equal(bump.ok, false);
  assert.match(bump.failures.join(' '), /8\.1\.3/);
});
