/**
 * Notes the Compact runtime API reference version gap.
 * Upstream: midnightntwrk/midnight-docs#1564
 * Official matrix: runtime 0.16.0 on ledger 8 networks; API ref shows 0.20.0.
 * This file does not call midnight-js, compile Compact, or touch the public indexer/node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const RUNTIME_API_REF_VERSION = '0.20.0';
export const MATRIX_RUNTIME_VERSION = '0.16.0';

export function describeRuntimeApiGap() {
  return {
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1564',
    apiReference: 'https://docs.midnight.network/api-reference/compact-runtime/',
    supportMatrix: 'https://docs.midnight.network/relnotes/support-matrix',
    documented: RUNTIME_API_REF_VERSION,
    networks: MATRIX_RUNTIME_VERSION,
    advice: 'Pin @midnight-ntwrk/compact-runtime@0.16.0 and ignore 0.20.0-only exports until the networks move to ledger 9.',
  };
}
