/**
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkUntakenCompareFile, checkUntakenCompareSource } from '../src/untaken-compare-invariant.mjs';

const contract = join(dirname(fileURLToPath(import.meta.url)), '../../../contracts/hello-midnight/untaken-compare.compact');

test('untaken compare source hoists the relational check', () => {
  const result = checkUntakenCompareFile(contract);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.docs.includes('toolchain-0.31.0'), true);
});

test('a relational compare inside if fails the check', () => {
  const bad = checkUntakenCompareSource(`
    pragma language_version >= 0.22 && <= 0.23;
    export circuit storeIfUnderCap(value: Uint<64>, cap: Uint<64>, take: Boolean): [] {
      const under = value < cap;
      assert(under, "value is not under cap");
      if (take) {
        if (value > cap) { stored = disclose(value); }
      }
    }
  `);
  assert.equal(bad.ok, false);
});
