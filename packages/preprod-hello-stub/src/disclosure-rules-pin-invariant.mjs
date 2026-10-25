// Local source check for the three disclosure rules reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/compact/reference/explicit-disclosure
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/disclosure-rules-pin.compact");

export const DISCLOSURE_RULES_PIN = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/compact/reference/explicit-disclosure",
  summary:
    "Map key needs disclose(); branch-then-ledger-write needs disclose(); assert on a secret does not.",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
};

/**
 * @param {string} source
 * @returns {{ok: boolean, hasMapKeyDisclose: boolean, hasBranchDisclose: boolean, hasAssertSecret: boolean, note: string}}
 */
export function checkDisclosureRulesPin(source) {
  if (typeof source !== "string") {
    return {
      ok: false,
      hasMapKeyDisclose: false,
      hasBranchDisclose: false,
      hasAssertSecret: false,
      note: "not a string",
    };
  }
  const flat = source.replace(/\s+/g, " ");
  const hasMapKeyDisclose = /assert\s*\(\s*m\.member\s*\(\s*disclose\s*\(\s*k\s*\)/.test(flat);
  const hasBranchDisclose = /if\s*\(\s*disclose\s*\(\s*secretNum\s*\(\s*\)\s*>/.test(flat);
  const hasAssertSecret = /assert\s*\(\s*secretNum\s*\(\s*\)\s*>/.test(flat);
  const ok = hasMapKeyDisclose && hasBranchDisclose && hasAssertSecret;
  return {
    ok,
    hasMapKeyDisclose,
    hasBranchDisclose,
    hasAssertSecret,
    note: ok
      ? "Sample pins the three reported disclosure rules from servicedesk#266."
      : "Expected disclose(k) in m.member, disclose on the branch, and bare assert(secretNum()).",
  };
}

// Self-check when run directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("disclosure-rules-pin-invariant.mjs")
) {
  try {
    const text = readFileSync(sample, "utf8");
    const result = checkDisclosureRulesPin(text);
    console.log(JSON.stringify({ ...DISCLOSURE_RULES_PIN, check: result }, null, 2));
    process.exit(result.ok ? 0 : 1);
  } catch (err) {
    console.error(String(err));
    process.exit(1);
  }
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
