/**
 * callTx finalization sample decoder.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { decodeCallTxFinalizationSample, TX_STATUSES } from '../src/calltx-finalization-decode.mjs';

const PUBLISHED = `
const tx = await deployedContract.callTx.increment();
const receipt = await tx.wait();
expect(receipt.status).toBe('APPLIED_TO_CHAIN');
expect(receipt.found).toBe(true);
`;

describe('callTx finalization decode (midnight-docs#1487)', () => {
  it('flags tx.wait and APPLIED_TO_CHAIN from the live sample', () => {
    const report = decodeCallTxFinalizationSample(PUBLISHED);
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'outdated-finalization-sample');
    assert.equal(report.waits, true);
    assert.equal(report.appliedToChain, true);
    assert.equal(report.receiptFound, true);
    assert.deepEqual(report.statuses, TX_STATUSES);
    assert.match(report.hint, /SucceedEntirely/);
    assert.match(report.hint, /does not fix the public indexer or node/);
    assert.match(report.credit, /kshot9000@gmail.com/);
  });

  it('accepts a snippet that already names SucceedEntirely', () => {
    const report = decodeCallTxFinalizationSample(
      'if (finalizedData.status !== SucceedEntirely) throw new Error("fallible");',
    );
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'aligned-status-names');
  });

  it('reads the lab contract as a disclosed-write counterpart, not a wait() sample', () => {
    const source = readFileSync(
      new URL('../../../contracts/hello-midnight/calltx-finalization.compact', import.meta.url),
      'utf8',
    );
    const body = source.split('*/').pop();
    assert.match(body, /pragma language_version 0\.23;/);
    assert.match(body, /posts\.increment\(1\)/);
    assert.doesNotMatch(body, /Bytes<32>\{\}/);
    assert.doesNotMatch(body, /^const /m);
    const report = decodeCallTxFinalizationSample(source);
    assert.equal(report.classification, 'unrecognized');
  });
});
