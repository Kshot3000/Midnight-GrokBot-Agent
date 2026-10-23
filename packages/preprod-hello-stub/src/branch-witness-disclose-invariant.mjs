// Local source check for the branching-on-witness disclosure rule reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/compact/reference/explicit-disclosure
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/branch-witness-disclose.compact");

export const BRANCH_WITNESS_DISCLOSE = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/compact/reference/explicit-disclosure",
  summary:
    "Branching on a witness-derived value and then writing the ledger requires disclose() on the condition (or the written values). The bare form is rejected on Compact 0.31.1.",
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
 * @returns {{ok: boolean, hasDiscloseOnBranch: boolean, note: string}}
 */
export function checkBranchWitnessDisclose(source) {
  if (typeof source !== "string") {
    return { ok: false, hasDiscloseOnBranch: false, note: "not a string" };
  }
  const hasIf = /if\s*\(\s*disclose\s*\(\s*secretNum\s*\(\s*\)\s*>/.test(source.replace(/\s+/g, " "));
  const hasLedger = /val\s*=\s*1/.test(source) && /val\s*=\s*2/.test(source);
  if (hasIf && hasLedger) {
    return {
      ok: true,
      hasDiscloseOnBranch: true,
      note: "Sample discloses the witness comparison before the ledger writes.",
    };
  }
  return {
    ok: false,
    hasDiscloseOnBranch: false,
    note: "Expected disclose(secretNum() > ...) around the branch that writes the ledger.",
  };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("branch-witness-disclose-invariant.mjs")) {
  try {
    const text = readFileSync(sample, "utf8");
    const result = checkBranchWitnessDisclose(text);
    console.log(JSON.stringify({ ...BRANCH_WITNESS_DISCLOSE, check: result }, null, 2));
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
