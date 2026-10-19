/**
 * Deploy-pending-until-TTL classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/257
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { classifyDeployPendingTtl } from '../src/deploy-pending-ttl-decode.mjs';

describe('deploy pending TTL decode (servicedesk#257)', () => {
  it('flags a valid deploy that stayed pending until TTL', () => {
    const report = classifyDeployPendingTtl(
      'author_pendingExtrinsics showed the deploy until TTL. validate_transaction returned Valid. apply_extrinsic Ok(Ok). contract calls were included.',
    );
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'deploy-pending-until-ttl');
    assert.equal(report.signals.hasPending, true);
    assert.equal(report.signals.hasValid, true);
    assert.match(report.hint, /does not fix the public node/);
    assert.match(report.credit, /kshot9000@gmail.com/);
    assert.match(report.upstream, /257/);
  });

  it('also matches an explicit filter-deploy-txs mention',
    () => {
      const report = classifyDeployPendingTtl('--filter-deploy-txs still on the path');
      assert.equal(report.classification, 'deploy-pending-until-ttl');
      assert.equal(report.signals.mentionsFilter, true);
    },
  );

  it('does not match unrelated text', () => {
    const report = classifyDeployPendingTtl('hello world circuit proved');
    assert.equal(report.classification, 'not-deploy-pending');
  });

  it('rejects empty input', () => {
    const report = classifyDeployPendingTtl('');
    assert.equal(report.ok, false);
    assert.equal(report.classification, 'incomplete');
  });
});
