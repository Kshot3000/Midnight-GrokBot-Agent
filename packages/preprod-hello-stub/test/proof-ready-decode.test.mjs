import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyProofReady, PROOF_SERVER_PIN } from '../src/proof-ready-decode.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('ECONNREFUSED on 6300 is unreachable, not a queue', () => {
  const result = classifyProofReady({
    errorCode: 'ECONNREFUSED',
    errorMessage: 'connect ECONNREFUSED 127.0.0.1:6300',
  });
  assert.equal(result.kind, 'unreachable');
  assert.equal(result.unreachable, true);
  assert.equal(result.queued, false);
  assert.equal(result.publicProofServerFixed, false);
  assert.match(result.start, /proof-server:8\.1\.0/);
  assert.match(result.upstream, /midnight-docs\/issues\/1377/);
});

test('jobsPending with flat jobsProcessing is a queue on a live server', () => {
  const result = classifyProofReady({
    health: { status: 'ok' },
    version: PROOF_SERVER_PIN,
    ready: { status: 'ok', jobsProcessing: 0, jobsPending: 4, jobCapacity: 0 },
  });
  assert.equal(result.kind, 'queued');
  assert.equal(result.queued, true);
  assert.equal(result.unreachable, false);
  assert.match(result.reasons.join(' '), /jobsPending/);
});

test('health ok, ready ok, empty queue, pinned version is ready', () => {
  const result = classifyProofReady({
    health: { status: 'ok', timestamp: '2026-10-07T00:00:00Z' },
    version: '8.1.0',
    ready: { status: 'ok', jobsProcessing: 0, jobsPending: 0, jobCapacity: 0 },
  });
  assert.equal(result.kind, 'ready');
  assert.equal(result.ready, true);
});

test('a version other than 8.1.0 is a pin miss, not unreachable', () => {
  const result = classifyProofReady({
    health: { status: 'ok' },
    version: 'latest',
    ready: { status: 'ok', jobsProcessing: 0, jobsPending: 0 },
  });
  assert.equal(result.kind, 'version-pin');
  assert.equal(result.unreachable, false);
});
