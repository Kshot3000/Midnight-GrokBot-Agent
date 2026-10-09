import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyNpmImageGap,
  checkRecordedNpmImageGaps,
  HTML_PINS,
  matrixNpmImageGapCredit,
} from '../src/matrix-npm-image-gap.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

test('names a missing npmPackage and the non-public devtools repo', () => {
  const decoded = classifyNpmImageGap({
    component: 'Compact runtime',
    github: 'midnightntwrk/compact-devtools',
    tag: '0.16.0',
  });
  assert.equal(decoded.ok, false);
  assert.equal(decoded.kind, 'npm-or-image-gap');
  const codes = decoded.findings.map((item) => item.code);
  assert.ok(codes.includes('missing-npm-package'));
  assert.ok(codes.includes('devtools-repo-not-public'));
  assert.equal(decoded.docs, 'https://docs.midnight.network/relnotes/support-matrix');
  assert.match(decoded.claim, /does not fix the public indexer or node/);
});

test('flags indexer image tag 4.3.302 recorded on issue 1494', () => {
  const decoded = classifyNpmImageGap({
    component: 'Midnight Indexer',
    network: 'preprod',
    container: 'midnightntwrk/indexer-standalone:4.3.302',
  });
  assert.ok(decoded.findings.map((item) => item.code).includes('indexer-image-tag-unresolved'));
  assert.match(decoded.findings[0].detail, /4\.3\.3/);
});

test('records the preview node tag against the RPC version named on issue 1494', () => {
  const decoded = classifyNpmImageGap({
    component: 'Node (Midnight)',
    network: 'preview',
    tag: 'node-1.0.300',
  });
  assert.ok(decoded.findings.map((item) => item.code).includes('preview-node-vs-reported-rpc'));
  assert.match(decoded.findings[0].detail, /1\.0\.400-c338b9ac/);
});

test('does not flag a wallet SDK row that already has the recorded npm name', () => {
  const decoded = classifyNpmImageGap({
    component: 'Wallet SDK',
    npmPackage: '@midnight-ntwrk/wallet-sdk',
  });
  assert.equal(decoded.ok, true);
  assert.equal(decoded.kind, 'no-extra-gap');
});

test('keeps the lab pin on the HTML matrix proof server 8.1.0', () => {
  const recorded = checkRecordedNpmImageGaps();
  assert.equal(recorded.ok, true);
  assert.equal(recorded.htmlPins.proofServer, '8.1.0');
  assert.equal(HTML_PINS.midnightJs, '4.1.1');
  assert.equal(HTML_PINS.dappConnector, '4.0.1');
  assert.equal(HTML_PINS.compactToolchain, '0.31.1');
  assert.equal(recorded.walletSdkLatestTagRecorded, '1.1.0');
  assert.match(matrixNpmImageGapCredit, /Email: kshot9000@gmail.com/);
  assert.match(matrixNpmImageGapCredit, /Built by @kshot9000 https:\/\/x.com\/kshot9000/);
});
