// Classifier for midnight-docs#1628.
// Maps a Compact language or toolchain version string to whether it targets ledger 8 (matrix pin) or ledger 9.
// Does not invent APIs. Pins stay Compact ~0.31.1 / language ~0.23.

export function classifyCompactVersion(version) {
  if (typeof version !== 'string') return { pin: 'unknown', ledger: 'unknown' };
  const v = version.trim().toLowerCase();
  if (v.includes('0.23') || v.includes('0.31')) {
    return { pin: 'matrix', ledger: '8', note: 'Compatible with Preview/Preprod/Mainnet support matrix' };
  }
  if (v.includes('0.27') || v.includes('0.34') || v.includes('0.35') || v.includes('0.19') || v.includes('0.20')) {
    return { pin: 'ledger9', ledger: '9', note: 'Targets ledger 9; known incompatible with matrix pins' };
  }
  return { pin: 'unknown', ledger: 'unknown' };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
