/**
 * Preprod public endpoints follow the Blockfrost table in the networks guide.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1504
 * Does not call the indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCKFROST_PREPROD,
  PREPROD,
  RETIRED_PREPROD_HOSTS,
  isRetiredPreprodHost,
  redactProjectId,
  resolvePreprodPublicEndpoints,
} from '../src/preprod-config.mjs';

describe('preprod host cutoff config', () => {
  it('defaults to Blockfrost bases, not the hosted Preprod hosts', () => {
    assert.equal(PREPROD.indexer, BLOCKFROST_PREPROD.indexer);
    assert.equal(PREPROD.node, BLOCKFROST_PREPROD.node);
    assert.equal(PREPROD.proofServer, 'http://127.0.0.1:6300');
    assert.equal(isRetiredPreprodHost(RETIRED_PREPROD_HOSTS.indexer), true);
    assert.equal(isRetiredPreprodHost(PREPROD.indexer), false);
    assert.match(PREPROD.indexer, /\/api\/v0$/);
  });

  it('appends a preprod token and redacts it', () => {
    const resolved = resolvePreprodPublicEndpoints({ BLOCKFROST_PROJECT_ID: 'nightpreprodExample' });
    assert.equal(resolved.ok, true);
    assert.equal(resolved.tokenAttached, true);
    assert.match(resolved.indexer, /project_id=nightpreprodExample/);
    assert.match(resolved.nodeWS, /project_id=nightpreprodExample/);
    assert.equal(redactProjectId(resolved.indexer).includes('nightpreprodExample'), false);
  });

  it('rejects a mainnet token and a retired override', () => {
    const wrong = resolvePreprodPublicEndpoints({ BLOCKFROST_PROJECT_ID: 'nightmainnetExample' });
    assert.equal(wrong.ok, false);
    assert.equal(wrong.tokenAttached, false);
    const retired = resolvePreprodPublicEndpoints({
      MIDNIGHT_NODE_URL: RETIRED_PREPROD_HOSTS.node,
    });
    assert.equal(retired.ok, false);
    assert.match(retired.failures.join(' '), /shut down/);
  });
});
