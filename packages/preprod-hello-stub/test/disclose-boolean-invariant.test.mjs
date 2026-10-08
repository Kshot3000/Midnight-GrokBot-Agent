/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkDiscloseBoolean, checkLabDiscloseBoolean } from '../src/disclose-boolean-invariant.mjs';

test('lab disclose-boolean matches the official comparison form', () => {
  const result = checkLabDiscloseBoolean();
  assert.equal(result.ok, true, result.failures.join('; '));
  assert.equal(result.form, 'disclose(age >= 18)');
});

test('rejects disclosing the age itself', () => {
  const result = checkDiscloseBoolean(`
    pragma language_version >= 0.23;
    export ledger adult: Boolean;
    export circuit markAdult(age: Uint<8>): Boolean {
      const ok = disclose(age);
      adult = age;
      return age;
    }
  `);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((line) => /disclose age itself/.test(line)));
});

test('rejects a Field comparison', () => {
  const result = checkDiscloseBoolean(`
    pragma language_version >= 0.23;
    export ledger adult: Boolean;
    export circuit markAdult(age: Field): Boolean {
      const ok = disclose(age >= 18);
      adult = ok;
      return ok;
    }
  `);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((line) => /not Field/.test(line)));
});
