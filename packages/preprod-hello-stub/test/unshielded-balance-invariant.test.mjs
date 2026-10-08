/**
 * Local Compact source checks for unshielded sends.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/117
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { checkUnshieldedBalance } from '../src/unshielded-balance-invariant.mjs';

const GOOD = readFileSync(new URL('../../../contracts/hello-midnight/unshielded-balance.compact', import.meta.url), 'utf8');

test('covered send uses unshieldedBalanceGte and does not read exact balance', () => {
  const result = checkUnshieldedBalance(GOOD);
  assert.equal(result.ok, true);
  assert.equal(result.findings.length, 0);
});

test('flags sendUnshielded with no comparison', () => {
  const result = checkUnshieldedBalance(`
    export circuit pay(amount: Uint<128>, user: UserAddress): [] {
      sendUnshielded(nativeToken(), disclose(amount), right<ContractAddress, UserAddress>(disclose(user)));
    }
  `);
  assert.equal(result.ok, false);
  assert.equal(result.findings[0].kind, 'send-without-compare');
});

test('flags exact unshieldedBalance read', () => {
  const result = checkUnshieldedBalance(`
    export circuit pay(amount: Uint<128>, user: UserAddress): [] {
      assert(unshieldedBalance(nativeToken()) == disclose(amount), "exact");
      sendUnshielded(nativeToken(), disclose(amount), right<ContractAddress, UserAddress>(disclose(user)));
    }
  `);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((f) => f.kind === 'exact-balance-read'));
  assert.ok(result.findings.some((f) => f.kind === 'send-without-compare'));
});

test('receiveUnshielded alone is not a send-cover finding', () => {
  const result = checkUnshieldedBalance(`
    export circuit deposit(amount: Uint<128>): [] {
      receiveUnshielded(nativeToken(), disclose(amount));
    }
  `);
  assert.equal(result.ok, true);
});
