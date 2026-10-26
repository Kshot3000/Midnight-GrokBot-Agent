// Local note for the Compact runtime API reference version gap reported in
// https://github.com/midnightntwrk/midnight-docs/issues/1564
// Official: https://docs.midnight.network/relnotes/support-matrix
//           https://docs.midnight.network/api-reference/compact-runtime
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, compact-runtime 0.16.0
// LOCAL-TRUE. Does not import the runtime, compile Compact, call a proof server,
// or touch the public indexer/node.

export const COMPACT_RUNTIME_API_GAP = {
  upstream: "https://github.com/midnightntwrk/midnight-docs/issues/1564",
  officialMatrix: "https://docs.midnight.network/relnotes/support-matrix",
  officialApi: "https://docs.midnight.network/api-reference/compact-runtime",
  summary:
    "The Compact runtime API reference documents @midnight-ntwrk/compact-runtime v0.20.0 (ledger 9). Public networks (Preview/Preprod/Mainnet) run ledger 8 and pair Compact toolchain 0.31.1 with runtime 0.16.0. Runtimes 0.19.0 and 0.20.0 are incompatible with midnight-js 4.1.1.",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    compactRuntime: "0.16.0",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
  documentedRuntime: "0.20.0",
  networkRuntime: "0.16.0",
  incompatible: ["0.19.0", "0.20.0"],
  examplesMissingOn016: [
    "jubjubSchnorrSign",
    "jubjubSchnorrVerifyingKey",
    "sampleJubjubSchnorrSk",
  ],
};

/**
 * @param {{ documented?: string, network?: string }} [opts]
 * @returns {{ok: boolean, gap: boolean, note: string}}
 */
export function checkRuntimeApiGap(opts = {}) {
  const documented = opts.documented ?? COMPACT_RUNTIME_API_GAP.documentedRuntime;
  const network = opts.network ?? COMPACT_RUNTIME_API_GAP.networkRuntime;
  const gap = documented !== network;
  if (gap && COMPACT_RUNTIME_API_GAP.incompatible.includes(documented)) {
    return {
      ok: true,
      gap: true,
      note: `API reference documents ${documented}; public networks require ${network}. ${documented} is listed as incompatible.`,
    };
  }
  if (!gap) {
    return { ok: true, gap: false, note: "Documented runtime matches network pin." };
  }
  return { ok: false, gap: true, note: "Unexpected documented vs network runtime pair." };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("compact-runtime-api-gap.mjs")) {
  const result = checkRuntimeApiGap();
  console.log(JSON.stringify({ ...COMPACT_RUNTIME_API_GAP, check: result }, null, 2));
  process.exit(result.ok && result.gap ? 0 : 1);
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
