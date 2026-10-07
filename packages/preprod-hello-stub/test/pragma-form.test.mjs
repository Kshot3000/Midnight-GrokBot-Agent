/**
 * Pragma form classifier. Does not invoke compactc.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { classifyPragma } from '../src/pragma-form.mjs';

describe('pragma form (midnight-docs#1387)', () => {
  it('flags the writing-a-contract 0.16 sample as below the lab pin', () => {
    const report = classifyPragma('pragma language_version 0.16;\nimport CompactStandardLibrary;\n');
    assert.equal(report.ok, false);
    assert.equal(report.page, 'writing-a-contract');
    assert.match(report.failures.join(' '), /0\.16/);
  });

  it('accepts the troubleshoot >= 0.23 sample and the bulletin-board pair', () => {
    const floor = classifyPragma('pragma language_version >= 0.23;');
    assert.equal(floor.ok, true);
    assert.equal(floor.page, 'troubleshoot-compiler-errors');
    const pair = classifyPragma('pragma language_version 0.23;');
    assert.equal(pair.ok, true);
    assert.equal(pair.page, 'bulletin-board');
  });

  it('treats the security page 0.23.0 trio as grammar-legal and on the pin', () => {
    const report = classifyPragma('pragma language_version 0.23.0;');
    assert.equal(report.ok, true);
    assert.equal(report.page, 'security-best-practices');
    assert.equal(report.version, '0.23.0');
  });

  it('reads the lab contract as the pair form', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/pragma-form.compact', import.meta.url), 'utf8');
    const report = classifyPragma(source);
    assert.equal(report.ok, true);
    assert.equal(report.version, '0.23');
    assert.match(report.credit, /kshot9000@gmail.com/);
  });
});
