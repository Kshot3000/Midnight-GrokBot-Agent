/**
 * Cross-contract pin classifier. Does not invoke compactc.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { CROSS_CONTRACT_UNSUPPORTED, decodeCrossContractPin } from '../src/cross-contract-pin.mjs';

describe('cross-contract pin (servicedesk#236)', () => {
  it('names the official compiler sentence as a ledger-8 refusal', () => {
    const report = decodeCrossContractPin(`source-errorf: ${CROSS_CONTRACT_UNSUPPORTED}`);
    assert.equal(report.unsupportedOnLedger8, true);
    assert.equal(report.stayOnPin, true);
    assert.equal(report.pin.compact, '0.31.1');
    assert.match(report.fix, /local circuit/);
  });

  it('treats a 0.34.0 bump as the servicedesk#236 deploy mismatch', () => {
    const report = decodeCrossContractPin("checkRuntimeVersion('0.19.0') from compact toolchain 0.34.0");
    assert.equal(report.ledger9Toolchain, true);
    assert.equal(report.unsupportedOnLedger8, false);
    assert.match(report.fix, /servicedesk#236/);
  });

  it('does not invent a hit on an unrelated prove error', () => {
    const report = decodeCrossContractPin('Error: connect ECONNREFUSED 127.0.0.1:6300');
    assert.equal(report.stayOnPin, false);
    assert.equal(report.fix, null);
  });

  it('reads the lab contract as a local circuit on language 0.23', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/no-cross-contract.compact', import.meta.url), 'utf8');
    assert.match(source, /pragma language_version 0\.23;/);
    assert.doesNotMatch(source, /export circuit \w+\([^)]*:/);
    assert.match(source, /export circuit tick\(\)/);
    assert.match(source, /kshot9000@gmail.com/);
    assert.match(source, /cross-contract calls are not yet supported/);
    const circuit = source.split('export circuit tick')[1];
    assert.equal(decodeCrossContractPin(circuit).unsupportedOnLedger8, false);
  });
});
