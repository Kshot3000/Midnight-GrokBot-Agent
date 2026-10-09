/**
 * Decode the official Compact 0.31.1 cross-contract refusal.
 * Does not compile Compact, call midnight-js, or dial a node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const CROSS_CONTRACT_UNSUPPORTED = 'cross-contract calls are not yet supported';

export const LEDGER8_PIN = {
  compact: '0.31.1',
  language: '0.23',
  ledger: 8,
  midnightJs: '4.1.1',
  proofServer: '8.1.0',
};

const LEDGER9_TOOLCHAIN = /compact(?:\s+toolchain)?\s+0\.3[45]\.0|checkRuntimeVersion\('0\.(?:19|20)\.0'\)/;

export function decodeCrossContractPin(message) {
  const text = String(message ?? '');
  const unsupported = text.includes(CROSS_CONTRACT_UNSUPPORTED);
  const ledger9Toolchain = LEDGER9_TOOLCHAIN.test(text);
  return {
    unsupportedOnLedger8: unsupported,
    ledger9Toolchain,
    stayOnPin: unsupported || ledger9Toolchain,
    pin: LEDGER8_PIN,
    fix: unsupported
      ? 'Restructure to a local circuit. Compact 0.31.1 / language 0.23 targets ledger 8. Cross-contract calls need ledger 9 (toolchain 0.33.0+), which the support matrix says Preview, Preprod, and Mainnet cannot deploy.'
      : ledger9Toolchain
        ? 'Do not use Compact 0.34.0 or 0.35.0 with midnight-js 4.1.1. servicedesk#236 is the deploy failure that follows that bump.'
        : null,
    credit: 'kshot9000@gmail.com',
  };
}
