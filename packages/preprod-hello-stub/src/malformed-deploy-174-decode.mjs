// MalformedContractDeploy (Custom error 174) classifier
// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
//
// Official: https://docs.midnight.network/nodes/error-codes
// Upstream: https://github.com/midnightntwrk/servicedesk/issues/257
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
// Does not submit, does not claim a public indexer or node fix.

export function decodeMalformedDeploy174(text) {
  if (typeof text !== "string" || text.length === 0) {
    return { kind: "not-174", reason: "empty" };
  }
  const lower = text.toLowerCase();
  const has174 = /\b174\b/.test(text) || lower.includes("malformedcontractdeploy");
  const hasCustom = lower.includes("custom error") || lower.includes("1010");
  if (has174 && (hasCustom || lower.includes("malformed"))) {
    return {
      kind: "malformed-contract-deploy-174",
      official: "https://docs.midnight.network/nodes/error-codes",
      upstream: "https://github.com/midnightntwrk/servicedesk/issues/257",
      note: "Structural deploy rejection (non-zero balance or incorrect charged state). Distinct from pending-until-TTL with Valid validate (#257).",
    };
  }
  return { kind: "not-174", reason: "no-match" };
}
