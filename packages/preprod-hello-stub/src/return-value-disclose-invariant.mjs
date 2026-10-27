// Local source check for the exported-circuit return disclosure rules reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/guides/security-best-practices
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/return-value-disclose.compact");

export const RETURN_VALUE_DISCLOSE = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/guides/security-best-practices",
  summary:
    "Returning a circuit argument needs no disclose(); returning a witness does. Neither return value is in the published transaction — only a randomized commitment. The value reaches the calling DApp.",
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
 * @returns {{ok: boolean, hasReturnArgBare: boolean, hasReturnWitnessDisclose: boolean, note: string}}
 */
export function checkReturnValueDisclose(source) {
  if (typeof source !== "string") {
    return {
      ok: false,
      hasReturnArgBare: false,
      hasReturnWitnessDisclose: false,
      note: "not a string",
    };
  }
  const normalized = source.replace(/\s+/g, " ");
  const hasReturnArgBare = /export circuit returnArg\([^)]*\):[^\{]*\{[^}]*return x;/.test(normalized);
  const hasReturnWitnessDisclose = /return disclose\(\s*secretValue\s*\(\s*\)\s*\)/.test(normalized);
  if (hasReturnArgBare && hasReturnWitnessDisclose) {
    return {
      ok: true,
      hasReturnArgBare: true,
      hasReturnWitnessDisclose: true,
      note: "Sample returns a bare argument and a disclosed witness value.",
    };
  }
  return {
    ok: false,
    hasReturnArgBare,
    hasReturnWitnessDisclose,
    note: "Expected bare return of circuit arg and disclose(secretValue()) for the witness return.",
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
