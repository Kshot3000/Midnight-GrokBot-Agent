/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBytesUintCastFile,
  checkBytesUintCastSource,
  decodeConvertBytesMaxval,
  maxvalBigint,
} from '../src/bytes-uint-cast-invariant.mjs';

const contract = join(dirname(fileURLToPath(import.meta.url)), '../../../contracts/hello-midnight/bytes-uint-cast.compact');

test('bytes-to-field cast stays outside the if', () => {
  const result = checkBytesUintCastFile(contract);
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.docs.includes('toolchain-0.31.0'), true);
});

test('a Bytes cast inside if fails the check', () => {
  const bad = checkBytesUintCastSource(`
    pragma language_version >= 0.22 && <= 0.23;
    export circuit storeBytesAsField(raw: Bytes<8>, take: Boolean): [] {
      const asField = raw as Field;
      if (take) {
        stored = disclose(raw as Field);
      }
    }
  `);
  assert.equal(bad.ok, false);
});

test('Bytes as Uint is rejected', () => {
  const bad = checkBytesUintCastSource(`
    pragma language_version >= 0.22 && <= 0.23;
    export circuit storeBytesAsField(raw: Bytes<8>, take: Boolean): [] {
      const asField = raw as Uint<64>;
      if (take) { stored = disclose(asField); }
    }
  `);
  assert.equal(bad.ok, false);
});

test('convertBytesToUint number maxval is named', () => {
  const decoded = decodeConvertBytesMaxval(
    new TypeError("convertBytesToUint maxval expected bigint, received number"),
  );
  assert.equal(decoded.ok, false);
  assert.match(decoded.hint, /bigint/);
  assert.equal(maxvalBigint(8), 255n);
  assert.equal(decodeConvertBytesMaxval(new Error('unrelated')).ok, true);
});
