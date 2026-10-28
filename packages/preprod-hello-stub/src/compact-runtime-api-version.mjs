/**
 * Local-only pin recorder for midnightntwrk/midnight-docs#1564.
 * Does not import @midnight-ntwrk/compact-runtime. Does not call any API.
 * Official matrix pins Compact runtime 0.16.0 with toolchain 0.31.1 and midnight-js 4.1.1.
 * The published API reference currently documents 0.20.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const OFFICIAL_COMPACT_RUNTIME_PIN = '0.16.0';
export const DOCUMENTED_API_REFERENCE_VERSION = '0.20.0';
export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1564';

/**
 * Classifies the reported mismatch. Pure data; no network or package resolution.
 * @returns {{ officialPin: string, documentedReference: string, mismatch: boolean, note: string }}
 */
export function classifyRuntimeApiVersion() {
  return {
    officialPin: OFFICIAL_COMPACT_RUNTIME_PIN,
    documentedReference: DOCUMENTED_API_REFERENCE_VERSION,
    mismatch: OFFICIAL_COMPACT_RUNTIME_PIN !== DOCUMENTED_API_REFERENCE_VERSION,
    note: 'Networks and Midnight.js 4.1.1 pin compact-runtime 0.16.0. The API reference documents 0.20.0. Do not import the newer runtime on the ledger-8 stack.',
  };
}
