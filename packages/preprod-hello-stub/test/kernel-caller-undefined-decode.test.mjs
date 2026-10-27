/**
 * Local checks for the kernel.caller undefined decoder.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/202
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeKernelCallerUndefined } from '../src/kernel-caller-undefined-decode.mjs';

const REPORTED =
  'compactc: operation caller undefined for ledger field type Kernel';

test('classifies the servicedesk#202 compactc rejection', () => {
  const decoded = decodeKernelCallerUndefined(REPORTED);
  assert.equal(decoded.ok, true);
  assert.equal(decoded.kind, 'kernel-caller-undefined');
  assert.equal(decoded.isKernelCallerUndefined, true);
  assert.match(decoded.hint, /0\.31\.1/);
  assert.equal(decoded.upstream.includes('/servicedesk/issues/202'), true);
});

test('does not classify a Compact assert as a missing kernel.caller', () => {
  const decoded = decodeKernelCallerUndefined(
    "Error: failed assert: Attempted to post to an occupied board",
  );
  assert.equal(decoded.ok, false);
  assert.equal(decoded.kind, 'unrecognized');
  assert.equal(decoded.isKernelCallerUndefined, false);
});

test('accepts an Error object with the same message', () => {
  const decoded = decodeKernelCallerUndefined(new Error(REPORTED));
  assert.equal(decoded.ok, true);
  assert.equal(decoded.isKernelCallerUndefined, true);
});
