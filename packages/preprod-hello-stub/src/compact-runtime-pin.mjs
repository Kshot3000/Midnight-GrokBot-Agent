// Compact runtime pin for current public networks (ledger 8).
// Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1564
// Official: https://docs.midnight.network/relnotes/support-matrix
// and https://docs.midnight.network/api-reference/compact-runtime
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
// Does not invent APIs. LOCAL-TRUE. No deploy claimed.

export const NETWORK_RUNTIME = '0.16.0';
export const PUBLISHED_API_RUNTIME = '0.20.0';
export const COMPATIBLE_TOOLCHAIN = '0.31.1';

/** True when the published API reference version is not the network pin. */
export function isPublishedApiMismatch(published = PUBLISHED_API_RUNTIME, network = NETWORK_RUNTIME) {
  return published !== network;
}

/** Reject treating the ledger-9 reference as the runtime for a 0.31.1 contract. */
export function assertNetworkRuntime(version) {
  if (version !== NETWORK_RUNTIME) {
    throw new Error(
      `runtime ${version} is not the network pin ${NETWORK_RUNTIME} (toolchain ${COMPATIBLE_TOOLCHAIN}); see midnight-docs#1564`
    );
  }
  return true;
}

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
