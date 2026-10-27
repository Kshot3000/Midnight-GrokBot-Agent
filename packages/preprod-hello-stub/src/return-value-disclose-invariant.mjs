// Local source check for the return-value disclosure rules reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/compact/reference/explicit-disclosure
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/return-value-disclose.compact");

export const RETURN_VALUE_DISCLOSE = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/compact/reference/explicit-disclosure",
  summary:
    "Returning a circuit argument needs no disclose(); returning a witness does. Neither return appears in the published transaction; a disclosed ledger write does.",
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
 * @returns {{ok: boolean, hasArgReturn: boolean, hasWitnessDisclose: boolean, note: string}}
 */
export function checkReturnValueDisclose(source) {
  if (typeof source !== "string") {
    return { ok: false, hasArgReturn: false, hasWitnessDisclose: false, note: "not a string" };
  }
  const normalized = source.replace(/\s+/g, " ");
  const hasArgReturn = /return\s+x\s*;/.test(normalized) && !/return\s+disclose\s*\(\s*x\s*\)/.test(normalized);
  const hasWitnessDisclose = /return\s+disclose\s*\(\s*secretValue\s*\(\s*\)\s*\)/.test(normalized);
  if (hasArgReturn && hasWitnessDisclose) {
    return {
      ok: true,
      hasArgReturn: true,
      hasWitnessDisclose: true,
      note: "Sample returns an argument without disclose and a witness with disclose.",
    };
  }
  return {
    ok: false,
    hasArgReturn,
    hasWitnessDisclose,
    note: "Expected bare return x; and return disclose(secretValue());",
  };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("return-value-disclose-invariant.mjs")) {
  try {
    const text = readFileSync(sample, "utf8");
    const result = checkReturnValueDisclose(text);
    console.log(JSON.stringify({ ...RETURN_VALUE_DISCLOSE, check: result }, null, 2));
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
