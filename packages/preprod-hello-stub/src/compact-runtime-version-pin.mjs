/**
 * Compact runtime version pin for ledger-8 networks.
 * Upstream: midnightntwrk/midnight-docs#1564
 * Official: https://docs.midnight.network/relnotes/support-matrix
 *
 * Does not call npm, the compiler, or any network. Only documents the pin.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const PINNED_RUNTIME = '0.16.0';
export const PINNED_TOOLCHAIN = '0.31.1';
export const LEDGER_9_RUNTIMES = Object.freeze(['0.19.0', '0.20.0']);

/** Names present on the 0.20.0 reference but absent from 0.16.0 per #1564. */
export const LEDGER_9_ONLY_EXPORTS = Object.freeze([
  'jubjubSchnorrSign',
  'jubjubSchnorrVerifyingKey',
  'sampleJubjubSchnorrSk',
]);

export function isPinnedRuntime(version) {
  return version === PINNED_RUNTIME;
}

export function isLedger9Runtime(version) {
  return LEDGER_9_RUNTIMES.includes(version);
}

export function pinAdvice() {
  return [
    `Pin Compact runtime ${PINNED_RUNTIME} (toolchain ${PINNED_TOOLCHAIN}) for Preview, Preprod, and Mainnet.`,
    'Runtimes 0.19.0 and 0.20.0 are ledger 9 and are incompatible with Midnight.js 4.1.1.',
    'The published API reference documents 0.20.0; do not import ledger-9-only names on the supported stack.',
  ].join(' ');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(pinAdvice());
  console.log('ledger-9-only exports:', LEDGER_9_ONLY_EXPORTS.join(', '));
}
