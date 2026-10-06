import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { checkCircuitCountSource } from '../src/circuit-count-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(new URL('../../../contracts/hello-midnight/circuit-count.compact', import.meta.url), 'utf8');

test('counts two exported circuits and publishes no protocol maximum', () => {
  const result = checkCircuitCountSource(source);
  assert.equal(result.ok, true);
  assert.equal(result.exportedCircuits, 2);
  assert.equal(result.constructors, 0);
  assert.equal(result.protocolMaximum, null);
  assert.match(result.upstream, /midnight-docs\/issues\/1387/);
});

test('rejects a second constructor and an invented numeric cap', () => {
  const bad = [
    'pragma language_version >= 0.23;',
    'export ledger hits: Counter;',
    'constructor() { hits.increment(1); }',
    'constructor() { hits.increment(1); }',
    'export circuit ping(): [] { hits.increment(1); }',
    '// protocol maximum = 8',
  ].join('\n');
  const result = checkCircuitCountSource(bad);
  assert.equal(result.ok, false);
  assert.match(result.failures.join(' '), /at most one constructor/);
  assert.match(result.failures.join(' '), /numeric protocol maximum/);
});
