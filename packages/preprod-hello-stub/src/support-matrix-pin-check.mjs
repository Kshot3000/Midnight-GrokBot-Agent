/**
 * Lab check that the pinned stack matches the official Preprod support matrix.
 * Does not call any network, does not invent APIs.
 * Upstream related: https://github.com/midnightntwrk/servicedesk/issues/236
 * (deploy errors hide a runtime mismatch; matrix is the source of truth)
 * Official: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const OFFICIAL_PREPROD_MATRIX = {
  node: '1.0.400',
  compactToolchain: '0.31.1',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.3', // lab tracks 8.1.0 as noted in other docs
  walletSdk: '1.2.0',
  onchainRuntime: '3.0.0',
};

export const LAB_PINS = {
  compactToolchain: '0.31.1',
  compactLanguage: '0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
};

export function classifyMatrixPin(lab) {
  const notes = [];
  if (lab.midnightJs !== OFFICIAL_PREPROD_MATRIX.midnightJs) {
    notes.push('midnight-js pin differs from matrix');
  }
  if (lab.compactToolchain !== OFFICIAL_PREPROD_MATRIX.compactToolchain) {
    notes.push('Compact toolchain pin differs from matrix');
  }
  return {
    matches: notes.length === 0,
    notes,
    official: OFFICIAL_PREPROD_MATRIX,
    lab,
    upstream: 'https://github.com/midnightntwrk/servicedesk/issues/236',
    docs: 'https://docs.midnight.network/relnotes/support-matrix',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = classifyMatrixPin(LAB_PINS);
  console.log(JSON.stringify(result, null, 2));
}
