// Local note for proof-server sizing gap reported in
// https://github.com/midnightntwrk/midnight-docs/issues/1634
// Official: https://docs.midnight.network/guides/local-proving
//          https://docs.midnight.network/api-reference/error-reference/proof-server-errors
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
// LOCAL-TRUE. Does not call the proof server, indexer, or node.

export const PROOF_SERVER_SIZING = {
  upstream: "https://github.com/midnightntwrk/midnight-docs/issues/1634",
  officialLocalProving: "https://docs.midnight.network/guides/local-proving",
  officialErrors: "https://docs.midnight.network/api-reference/error-reference/proof-server-errors",
  officialRun: "https://docs.midnight.network/guides/run-proof-server",
  defaultProvingWorkers: 2,
  defaultJobCapacity: 0,
  k17MemoryGiB: 1.5,
  note: "Official local-proving page records one test: k=17 took about 1.5 GiB in the container. Memory and time grow with circuit size. Builders must time their own circuits; the proof server logs request duration. No full hardware table is published.",
  summary:
    "midnight-docs#1634 asks for proof-server sizing. Official docs give the k=17 ~1.5 GiB data point, default 2 proving workers, and 'allocate more CPU or memory' for slow proofs. Lab does not invent further numbers and does not claim a fix of the public indexer or node.",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
};

/**
 * Return a short local sizing note for a reported k value.
 * Uses only the published 1.5 GiB data point for k=17; does not extrapolate.
 * @param {number} k
 * @returns {{ok: boolean, note: string, dataPoint?: string}}
 */
export function sizingNoteForK(k) {
  if (typeof k !== "number" || !Number.isFinite(k) || k <= 0) {
    return { ok: false, note: "k must be a positive number" };
  }
  if (k === 17) {
    return {
      ok: true,
      dataPoint: "~1.5 GiB in one official test",
      note: "Matches the published data point in local-proving: k=17 took about 1.5 GiB. Still measure on your machine.",
    };
  }
  return {
    ok: true,
    note: `No official memory figure for k=${k}. Official docs say time and memory grow with circuit size; time your own circuits (proof server logs request duration). Does not invent a number.`,
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
