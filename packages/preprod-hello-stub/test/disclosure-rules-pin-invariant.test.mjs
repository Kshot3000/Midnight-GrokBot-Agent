/**
 * Local checks for the three disclosure rules pin.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkDisclosureRulesPin } from "../src/disclosure-rules-pin-invariant.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/disclosure-rules-pin.compact");

test("disclosure-rules-pin.compact satisfies the three reported rules", () => {
  const text = readFileSync(sample, "utf8");
  const result = checkDisclosureRulesPin(text);
  assert.equal(result.ok, true, result.note);
  assert.equal(result.hasMapKeyDisclose, true);
  assert.equal(result.hasBranchDisclose, true);
  assert.equal(result.hasAssertSecret, true);
});

test("rejects a sample missing disclose on the Map key", () => {
  const bad = `
    export circuit hasKey(k: Bytes<32>): [] {
      assert(m.member(k), "missing");
    }
    export circuit branchOnWitness(): [] {
      if (disclose(secretNum() > 5)) { val = 1; } else { val = 2; }
    }
    export circuit assertSecret(): [] {
      assert(secretNum() > 5, "too small");
    }
  `;
  const result = checkDisclosureRulesPin(bad);
  assert.equal(result.ok, false);
  assert.equal(result.hasMapKeyDisclose, false);
});
