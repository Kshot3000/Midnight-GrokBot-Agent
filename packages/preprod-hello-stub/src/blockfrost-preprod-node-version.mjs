// Local note for the Blockfrost Preprod node version string reported in
// https://github.com/midnightntwrk/servicedesk/issues/267
// Official: https://docs.midnight.network/relnotes/support-matrix
//          https://docs.midnight.network/relnotes/network
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not call public RPC, indexer, or node.

export const BLOCKFROST_PREPROD_NODE = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/267",
  officialMatrix: "https://docs.midnight.network/relnotes/support-matrix",
  officialNetwork: "https://docs.midnight.network/relnotes/network",
  officialNode: "1.0.400",
  officialSpecVersion: 1000300,
  reportedBlockfrost: "2.1.0-00000000000",
  summary:
    "Official Preprod node pin is 1.0.400 (runtime specVersion 1000300). Blockfrost Preprod system_version is reported as 2.1.0-00000000000 with the same specVersion. Does not claim a node fix.",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
};

/**
 * Classify a reported system_version string against the official pin and the issue report.
 * @param {string} systemVersion
 * @returns {{ok: boolean, matchesOfficial?: boolean, matchesReported?: boolean, note: string}}
 */
export function classifyBlockfrostPreprodNodeVersion(systemVersion) {
  if (typeof systemVersion !== "string") {
    return { ok: false, note: "not a string" };
  }
  const v = systemVersion.trim();
  if (v.startsWith("1.0.400")) {
    return {
      ok: true,
      matchesOfficial: true,
      matchesReported: false,
      note: "Matches official Preprod node pin 1.0.400.",
    };
  }
  if (v === "2.1.0-00000000000" || v.startsWith("2.1.0-")) {
    return {
      ok: true,
      matchesOfficial: false,
      matchesReported: true,
      note: "Matches the Blockfrost Preprod string reported in servicedesk#267. Runtime specVersion is still reported as 1000300. Does not claim a fix.",
    };
  }
  return {
    ok: false,
    note: "Does not match official 1.0.400 or the reported 2.1.0-00000000000 string.",
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
