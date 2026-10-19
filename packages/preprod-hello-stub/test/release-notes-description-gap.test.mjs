/**
 * Local checks for the release-notes shared-description classifier.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1561
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyReleaseNotesDescription, LAB_PINS } from '../src/release-notes-description-gap.mjs';

test('flags Node release notes as shared description', () => {
  const r = classifyReleaseNotesDescription('node', '1.0.400');
  assert.equal(r.shared, true);
  assert.equal(r.component, 'node');
  assert.equal(r.group.pageCount, 11);
  assert.match(r.advice, /support matrix/);
});

test('flags midnight-js and dapp-connector groups from #1561', () => {
  const js = classifyReleaseNotesDescription('midnight-js', '4.0.4');
  assert.equal(js.shared, true);
  const conn = classifyReleaseNotesDescription('dapp-connector', '4.0.1');
  assert.equal(conn.shared, true);
  assert.equal(conn.group.pageCount, 2);
});

test('does not invent a shared group for the lab Compact pin', () => {
  const r = classifyReleaseNotesDescription('compact', '0.31.1');
  assert.equal(r.shared, false);
  assert.equal(r.labPins.compact, LAB_PINS.compact);
  assert.equal(r.labPins.midnightJs, '4.1.1');
});
