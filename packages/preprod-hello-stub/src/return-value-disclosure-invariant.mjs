// Local source check for the return-value disclosure rules reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official:
//   https://docs.midnight.network/compact/reference/explicit-disclosure
//   https://docs.midnight.network/guides/security-best-practices
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sample = join(here, "../../../contracts/hello-midnight/return-value-disclosure.compact");

export const RETURN_VALUE_DISCLOSURE = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: [
    "https://docs.midnight.network/compact/reference/explicit-disclosure",
    "https://docs.midnight.network/guides/security-best-practices",
  ],
  summary:
    "Returning a circuit argument needs no disclose(); returning a witness does. Neither return appears in the published transaction (only a randomized commitment). A disclosed ledger write does.",
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
 * @returns {{ok: boolean, hasReturnArg: boolean, hasReturnWitnessDisclose: boolean, hasLedgerDisclose: boolean, note: string}}
 */
export function checkReturnValueDisclosure(source) {
  if (typeof source !== "string") {
    return { ok: false, hasReturnArg: false, hasReturnWitnessDisclose: false, hasLedgerDisclose: false, note: "not a string" };
  }
  const flat = source.replace(/\s+/g, " ");
  const hasReturnArg = /export\s+circuit\s+returnArg\s*\([^)]*\)\s*:\s*Bytes<32>\s*\{\s*return\s+x\s*;\s*\}/.test(flat);
  const hasReturnWitnessDisclose = /return\s+disclose\s*\(\s*secret\s*\(\s*\)\s*\)/.test(flat);
  const hasLedgerDisclose = /stored\s*=\s*disclose\s*\(\s*x\s*\)/.test(flat);
  if (hasReturnArg && hasReturnWitnessDisclose && hasLedgerDisclose) {
    return {
      ok: true,
      hasReturnArg: true,
      hasReturnWitnessDisclose: true,
      hasLedgerDisclose: true,
      note: "Sample shows returnArg without disclose, returnWitness with disclose, and disclosed ledger write.",
    };
  }
  return {
    ok: false,
    hasReturnArg,
    hasReturnWitnessDisclose,
    hasLedgerDisclose,
    note: "Expected return x on arg, return disclose(secret()) on witness, and stored = disclose(x).",
  };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("return-value-disclosure-invariant.mjs")) {
  try {
    const text = readFileSync(sample, "utf8");
    const result = checkReturnValueDisclosure(text);
    console.log(JSON.stringify({ ...RETURN_VALUE_DISCLOSURE, check: result }, null, 2));
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
