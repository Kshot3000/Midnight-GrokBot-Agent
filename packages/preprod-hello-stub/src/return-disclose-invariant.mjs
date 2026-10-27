// Local source check for return-value disclosure semantics reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/compact/reference/explicit-disclosure
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/return-disclose-not-onchain.compact");

export const RETURN_DISCLOSE_NOT_ONCHAIN = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/compact/reference/explicit-disclosure",
  summary:
    "Returning a witness requires disclose(); returning a circuit argument does not. Per #266 the returned value reaches the DApp but is not in the published transaction raw bytes (unlike a ledger store).",
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
 * @returns {{ok: boolean, hasReturnWitnessDisclose: boolean, hasReturnArgBare: boolean, note: string}}
 */
export function checkReturnDisclose(source) {
  if (typeof source !== "string") {
    return { ok: false, hasReturnWitnessDisclose: false, hasReturnArgBare: false, note: "not a string" };
  }
  const collapsed = source.replace(/\s+/g, " ");
  const hasReturnWitnessDisclose = /return\s+disclose\s*\(\s*secretValue\s*\(\s*\)\s*\)/.test(collapsed);
  const hasReturnArgBare = /export\s+circuit\s+returnArg\s*\(\s*x\s*:\s*Bytes\s*<\s*32\s*>\s*\)\s*:\s*Bytes\s*<\s*32\s*>\s*\{[^}]*return\s+x\s*;/.test(collapsed);
  if (hasReturnWitnessDisclose && hasReturnArgBare) {
    return {
      ok: true,
      hasReturnWitnessDisclose: true,
      hasReturnArgBare: true,
      note: "Sample has disclose() on the witness return and a bare return of the circuit argument.",
    };
  }
  return {
    ok: false,
    hasReturnWitnessDisclose,
    hasReturnArgBare,
    note: "Expected return disclose(secretValue()) and a bare return x; in returnArg.",
  };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("return-disclose-invariant.mjs")) {
  try {
    const text = readFileSync(sample, "utf8");
    const result = checkReturnDisclose(text);
    console.log(JSON.stringify({ ...RETURN_DISCLOSE_NOT_ONCHAIN, check: result }, null, 2));
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
