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
import { checkSafeDowncastFile, checkSafeDowncastSource } from '../src/safe-downcast-invariant.mjs';

const contract = join(dirname(fileURLToPath(import.meta.url)), '../../../contracts/hello-midnight/safe-downcast.compact');

test('safe downcast source keeps the assert outside the if', () => {
  const result = checkSafeDowncastFile(contract);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.docs.includes('toolchain-0.31.1'), true);
});

test('collapsed cast without assert fails the check', () => {
  const bad = checkSafeDowncastSource(`
    pragma language_version >= 0.22 && <= 0.23;
    export circuit storeByte(value: Uint<64>, take: Boolean): [] {
      if (take) { stored = disclose(value as Uint<8>); }
    }
  `);
  assert.equal(bad.ok, false);
});
