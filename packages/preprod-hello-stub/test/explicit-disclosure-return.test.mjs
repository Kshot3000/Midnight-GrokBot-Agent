/**
 * Local checks for the explicit-disclosure return classifier.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
  EXPLICIT_DISCLOSURE_RETURN,
  classifyExplicitDisclosureReturn,
} from "../src/explicit-disclosure-return.mjs";

test("pins and upstream are recorded", () => {
  assert.match(EXPLICIT_DISCLOSURE_RETURN.upstream, /servicedesk\/issues\/266/);
  assert.equal(EXPLICIT_DISCLOSURE_RETURN.pins.compact, "~0.31.1");
  assert.equal(EXPLICIT_DISCLOSURE_RETURN.pins.midnightJs, "4.1.1");
});

test("return argument is accepted without disclose and not in published tx", () => {
  const r = classifyExplicitDisclosureReturn(
    "export circuit f(x: Uint<64>): Uint<64> { return x; }"
  );
  assert.equal(r.ok, true);
  assert.equal(r.case, "return-arg");
  assert.equal(r.requiresDisclose, false);
  assert.equal(r.reachesDapp, true);
  assert.equal(r.inPublishedTx, false);
});

test("return witness is rejected", () => {
  const r = classifyExplicitDisclosureReturn(
    "export circuit f(): Uint<64> { return secretNum(); }"
  );
  assert.equal(r.ok, true);
  assert.equal(r.case, "return-witness");
  assert.equal(r.requiresDisclose, true);
});

test("disclosed ledger store is in published tx", () => {
  const r = classifyExplicitDisclosureReturn("stored = disclose(x);");
  assert.equal(r.ok, true);
  assert.equal(r.case, "ledger-disclose");
  assert.equal(r.inPublishedTx, true);
});

test("assert-only is not in published tx", () => {
  const r = classifyExplicitDisclosureReturn(
    'assert(x != pad(32, ""), "empty");'
  );
  assert.equal(r.ok, true);
  assert.equal(r.case, "assert-only");
  assert.equal(r.inPublishedTx, false);
});
