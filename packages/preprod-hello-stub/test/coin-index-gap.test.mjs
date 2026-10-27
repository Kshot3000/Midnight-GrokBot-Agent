/**
 * Local checks for the coin-index gap classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/213
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from "node:assert/strict";
import test from "node:test";
import { classifyCoinIndexCell, UPSTREAM } from "../src/coin-index-gap.mjs";

test("upstream points at servicedesk#213", () => {
  assert.match(UPSTREAM, /servicedesk\/issues\/213/);
});

test("QualifiedShieldedCoinInfo publishes the coin value", () => {
  const r = classifyCoinIndexCell("QualifiedShieldedCoinInfo");
  assert.equal(r.ok, false);
  assert.equal(r.kind, "publishes-value");
});

test("Bytes<32> is the commitment-only form used by the lab sample", () => {
  const r = classifyCoinIndexCell("Bytes<32>");
  assert.equal(r.ok, true);
  assert.equal(r.kind, "commitment-only");
});
