/**
 * Language pin and official version-mismatch sentence.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkLanguagePin, decodeOfficialVersionMismatch } from '../src/matrix-language-pin.mjs';

describe('matrix language pin (servicedesk#236)', () => {
  it('rejects the 0.20 floor used by the 0.34.0 reproduction', () => {
    const report = checkLanguagePin('pragma language_version >= 0.20;\nexport circuit c(): [] {}\n');
    assert.equal(report.ok, false);
    assert.match(report.failures.join(' '), /0\.20/);
    assert.equal(report.pins.compactRuntime, '0.16.0');
  });

  it('accepts the official 0.23 floor', () => {
    const report = checkLanguagePin('pragma language_version >= 0.23;\nimport CompactStandardLibrary;\n');
    assert.equal(report.ok, true);
    assert.match(report.credit, /kshot9000@gmail.com/);
  });

  it('names the official version-mismatch sentence', () => {
    const decoded = decodeOfficialVersionMismatch(
      new Error('version mismatch: compiled code expects 0.19.0, runtime is 0.16.0'),
    );
    assert.equal(decoded.kind, 'official-version-mismatch');
    assert.equal(decoded.expected, '0.19.0');
    assert.equal(decoded.runtime, '0.16.0');
    assert.equal(decoded.ok, false);
  });

  it('notes when deploy construction hid that sentence', () => {
    const decoded = decodeOfficialVersionMismatch(
      new Error("ContractConfigurationError: Failed to configure constructor context with coin public key"),
    );
    assert.equal(decoded.kind, 'opaque-deploy-construction');
    assert.match(decoded.message, /version mismatch/);
  });
});
