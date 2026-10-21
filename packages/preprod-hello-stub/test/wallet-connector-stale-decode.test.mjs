/**
 * DApp Connector 4.0.1 stale-sample decoder.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1569
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  decodeWalletConnectorStaleSample,
  MIDNIGHT_JS_NETWORK_IDS,
} from '../src/wallet-connector-stale-decode.mjs';

const STALE = `
const networkId = 'PreProd';
const wallet = selectWallet();
await wallet.connect(networkId);
await connected.submitTransaction(tx, { payFees: true });
console.log(config.proverServerUri);
`;

describe('wallet connector stale decode (midnight-docs#1569)', () => {
  it('flags capitalized network id, payFees on submit, and bare proverServerUri', () => {
    const report = decodeWalletConnectorStaleSample(STALE);
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'stale-connector-sample');
    assert.equal(report.capitalizedNetwork, true);
    assert.equal(report.payFeesOnSubmit, true);
    assert.equal(report.submitWithOptions, true);
    assert.equal(report.noApiVersionFilter, true);
    assert.equal(report.proverServerUriDeprecated, true);
    assert.deepEqual(report.midnightJsNetworkIds, MIDNIGHT_JS_NETWORK_IDS);
    assert.match(report.hint, /getProvingProvider/);
    assert.match(report.hint, /does not fix the public pages/);
    assert.match(report.credit, /kshot9000@gmail.com/);
  });

  it('accepts a lowercase network id and a single-argument submitTransaction', () => {
    const report = decodeWalletConnectorStaleSample(
      "await wallet.connect('preprod'); await connected.submitTransaction(tx);",
    );
    assert.equal(report.ok, true);
    assert.equal(report.classification, 'aligned-connector-sample');
  });

  it('returns incomplete for an empty sample', () => {
    const report = decodeWalletConnectorStaleSample('   ');
    assert.equal(report.ok, false);
    assert.equal(report.classification, 'incomplete');
  });
});
