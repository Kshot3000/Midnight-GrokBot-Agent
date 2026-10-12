/**
 * Local checks for the built-in key reason decoder.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeBuiltinKey } from '../src/builtin-key-decode.mjs';

test('extracts key name from 9.x body', () => {
  const r = decodeBuiltinKey("bad input: `couldn't find built-in key increment`");
  assert.equal(r.ok, true);
  assert.equal(r.key, 'increment');
});

test('notes dropped body on 8.x', () => {
  const r = decodeBuiltinKey('bad input');
  assert.equal(r.ok, false);
  assert.match(r.hint, /dropped/);
});

test('ignores other errors', () => {
  const r = decodeBuiltinKey('Job Queue full');
  assert.equal(r.ok, false);
});
