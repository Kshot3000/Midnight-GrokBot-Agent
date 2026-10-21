// Local classifier for the explicit-disclosure return distinction reported in
// https://github.com/midnightntwrk/servicedesk/issues/266
// Official: https://docs.midnight.network/compact/reference/explicit-disclosure
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact, call a proof server, or touch the public indexer/node.

export const EXPLICIT_DISCLOSURE_RETURN = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/266",
  official: "https://docs.midnight.network/compact/reference/explicit-disclosure",
  summary:
    "Returning an exported-circuit argument does not require disclose() (accepted on 0.31.1). Returning a witness does. A returned value reaches the DApp but is not in the published transaction; a disclosed ledger store is.",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
};

/**
 * Classify a Compact source fragment against the cases reported in servicedesk#266.
 * @param {string} source
 * @returns {{ok: boolean, case?: string, requiresDisclose?: boolean, reachesDapp?: boolean, inPublishedTx?: boolean, note: string}}
 */
export function classifyExplicitDisclosureReturn(source) {
  if (typeof source !== "string") {
    return { ok: false, note: "not a string" };
  }
  const s = source.replace(/\s+/g, " ").trim();

  // Return witness without disclose — rejected
  if (/return\s+secret(?:Num|Value)?\s*\(\s*\)/.test(s) && !/disclose\s*\(/.test(s)) {
    return {
      ok: true,
      case: "return-witness",
      requiresDisclose: true,
      reachesDapp: false,
      inPublishedTx: false,
      note: "Rejected: potential witness-value disclosure must be declared.",
    };
  }

  // Return argument (no disclose) — accepted; reaches DApp, not in tx
  if (/return\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;/.test(s) && !/return\s+disclose/.test(s) && !/witness/.test(s)) {
    return {
      ok: true,
      case: "return-arg",
      requiresDisclose: false,
      reachesDapp: true,
      inPublishedTx: false,
      note: "Accepted without disclose(). Reaches caller; not in published transaction.",
    };
  }

  // Ledger disclose store — in published tx
  if (/=\s*disclose\s*\(/.test(s)) {
    return {
      ok: true,
      case: "ledger-disclose",
      requiresDisclose: true,
      reachesDapp: false,
      inPublishedTx: true,
      note: "Disclosed ledger store is present in the published transaction.",
    };
  }

  // Assert only — not in tx
  if (/assert\s*\(/.test(s) && !/return/.test(s) && !/=\s*disclose/.test(s)) {
    return {
      ok: true,
      case: "assert-only",
      requiresDisclose: false,
      reachesDapp: false,
      inPublishedTx: false,
      note: "Assert on secret or arg does not put the value in the published transaction.",
    };
  }

  return {
    ok: false,
    note: "No matching case from servicedesk#266.",
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
