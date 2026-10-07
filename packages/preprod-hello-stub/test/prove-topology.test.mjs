import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyProveTopology, DOCUMENTED_LACE_PROVE_URL } from '../src/prove-topology.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('Lace local URL is the documented prove path', () => {
  const result = classifyProveTopology({ proveUrl: DOCUMENTED_LACE_PROVE_URL });
  assert.equal(result.kind, 'local');
  assert.equal(result.accept, true);
  assert.equal(result.local, true);
  assert.equal(result.publicProofServerFixed, false);
  assert.match(result.start, /proof-server:8\.1\.0/);
  assert.match(result.upstream, /midnight-docs\/issues\/1383/);
});

test('127.0.0.1:6300 is the same local path', () => {
  const result = classifyProveTopology({ proveUrl: 'http://127.0.0.1:6300' });
  assert.equal(result.kind, 'local');
  assert.equal(result.accept, true);
});

test('a public host is not a documented prove path', () => {
  const result = classifyProveTopology({ proveUrl: 'https://proof.preprod.midnight.network' });
  assert.equal(result.kind, 'stranger-hosted');
  assert.equal(result.accept, false);
  assert.equal(result.publicProofServerFixed, false);
});

test('wallet-delegated mode is undocumented', () => {
  const result = classifyProveTopology({ mode: 'wallet-delegated' });
  assert.equal(result.kind, 'undocumented');
  assert.equal(result.accept, false);
  assert.match(result.reasons.join(' '), /does not name a wallet-delegated/);
});

test('stale midnightnetwork image is rejected', () => {
  const result = classifyProveTopology({
    proveUrl: 'http://localhost:6300',
    image: 'midnightnetwork/proof-server:latest --network testnet',
  });
  assert.equal(result.kind, 'stale-image');
  assert.equal(result.accept, false);
});

test('https on a machine the caller controls is allowed', () => {
  const result = classifyProveTopology({
    proveUrl: 'https://prover.internal.example:6300',
    controlledMachine: true,
  });
  assert.equal(result.kind, 'controlled-remote');
  assert.equal(result.accept, true);
  assert.equal(result.local, false);
});
