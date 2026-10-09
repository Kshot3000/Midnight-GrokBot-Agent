/**
 * Support-matrix JSON field gaps from midnight-docs#1494.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkRecordedMatrixJsonGaps, classifyMatrixJsonRow } from '../src/matrix-json-field-gap.mjs';

describe('matrix JSON field gap (midnight-docs#1494)', () => {
  it('flags the recorded mainnet node containerTag disagreement', () => {
    const report = checkRecordedMatrixJsonGaps();
    assert.equal(report.ok, true, report.findings.join('; '));
    assert.equal(report.htmlPins.proofServer, '8.1.0');
    assert.equal(report.htmlPins.compactToolchain, '0.31.1');
    assert.match(report.credit, /kshot9000@gmail.com/);
    assert.match(report.claim, /public node/);
  });

  it('does not invent a finding for a matching bare image tag', () => {
    const row = classifyMatrixJsonRow({
      component: 'Proof server',
      network: 'preprod',
      github: 'midnightntwrk/midnight-ledger',
      container: 'docker.io/midnightntwrk/proof-server',
      tag: 'proof-server-8.1.0',
      containerTag: '8.1.0',
    });
    assert.equal(row.findings.some((finding) => finding.code === 'tag-container-mismatch'), false);
    assert.equal(row.findings.some((finding) => finding.code === 'proof-server-tag-is-ledger'), false);
  });
});
