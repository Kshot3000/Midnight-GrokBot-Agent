import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeRuntimeApiGap,
  ABSENT_FROM_016,
} from '../src/compact-runtime-api-gap-decode.mjs';

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

test('classifies Version mismatch string from the support matrix', () => {
  const r = decodeRuntimeApiGap(
    'Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0',
  );
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'version-mismatch');
  assert.equal(r.expected, '0.16.0');
  assert.equal(r.actual, '0.20.0');
  assert.match(r.hint, /0\.16\.0/);
  assert.match(r.upstream, /1564/);
});

test('flags jubjubSchnorrSign as absent from 0.16.0 per the issue', () => {
  const r = decodeRuntimeApiGap(
    "Module '@midnight-ntwrk/compact-runtime' has no exported member 'jubjubSchnorrSign'",
  );
  assert.equal(r.ok, true);
  assert.equal(r.kind, 'absent-from-016');
  assert.equal(r.name, 'jubjubSchnorrSign');
  assert.ok(ABSENT_FROM_016.includes('jubjubSchnorrSign'));
});

test('ignores unrelated errors', () => {
  const r = decodeRuntimeApiGap('Failed Proof Server response: code="400"');
  assert.equal(r.ok, false);
  assert.equal(r.kind, 'other');
});
