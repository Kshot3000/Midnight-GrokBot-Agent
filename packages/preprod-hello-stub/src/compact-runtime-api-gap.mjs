/**
 * Classify Compact runtime API surface against the ledger-8 pin.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
 * Official: https://docs.midnight.network/relnotes/support-matrix
 *          https://docs.midnight.network/api-reference/compact-runtime
 *
 * The published API reference is for compact-runtime 0.20.0 (ledger 9).
 * Networks pin 0.16.0 with Compact 0.31.1. Names such as jubjubSchnorrSign
 * are not exported from 0.16.0.
 *
 * LOCAL-TRUE. Does not call the compiler, midnight-js, or a proof server.
 * Does not claim the public docs site, indexer, or node is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const LEDGER9_ONLY = [
  'jubjubSchnorrSign',
  'jubjubSchnorrVerifyingKey',
  'sampleJubjubSchnorrSk',
];

/**
 * @param {string} source
 * @returns {{ gap: boolean, hits: string[], note: string }}
 */
export function classifyRuntimeApiGap(source) {
  const text = String(source ?? '');
  const hits = LEDGER9_ONLY.filter((name) => text.includes(name));
  const pinnedLedger9 = /0\.20\.0|0\.19\.0|ledger\s*9|0\.34\.0|0\.35\.0/.test(text);
  const gap = hits.length > 0 && !pinnedLedger9;
  return {
    gap,
    hits,
    note: gap
      ? 'References 0.20.0-only runtime names without a ledger-9 pin. Networks pin compact-runtime 0.16.0 (Compact 0.31.1).'
      : 'No unpinned ledger-9-only runtime API names detected.',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = process.argv[2] ?? '';
  const result = classifyRuntimeApiGap(sample);
  console.log(JSON.stringify(result, null, 2));
}
