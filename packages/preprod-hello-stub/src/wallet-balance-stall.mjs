/**
 * wallet-balance-stall.mjs — symptom classifier for WalletFacade balance/finalization hang.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/194
 * Official Wallet SDK: https://docs.midnight.network/sdks/official/wallet-dev-guide
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 * This does not invent APIs. It does not claim the public indexer or node was fixed.
 * It only flags log text that matches the reported stall marker.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const MARKER = 'wallet-balance/finalization-enter';

/**
 * @param {string} logText
 * @returns {{ matches: boolean, note: string }}
 */
export function classifyWalletBalanceStall(logText) {
  if (typeof logText !== 'string') {
    return { matches: false, note: 'not a string' };
  }
  if (logText.includes(MARKER)) {
    return {
      matches: true,
      note: 'matches servicedesk#194 marker; CPU/RSS growth without return is the reported pattern',
    };
  }
  return { matches: false, note: 'marker not present' };
}

// Self-check when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = 'last marker: wallet-balance/finalization-enter';
  console.log(classifyWalletBalanceStall(sample));
}
