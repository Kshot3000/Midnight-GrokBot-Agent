// own-public-key-warning-invariant.mjs
// Preprod / lab helper: documents the ownPublicKey caller-auth invariant.
// Does not call the public indexer or node. Lab-only.
// Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
// Official: https://docs.midnight.network/compact/smart-contract-security
//
// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

/**
 * Returns a short diagnostic when code appears to use ownPublicKey for authorization.
 * @param {string} source Compact or TS snippet
 * @returns {{ ok: boolean, warning?: string }}
 */
export function checkOwnPublicKeyAuth(source) {
  if (!source || typeof source !== 'string') {
    return { ok: true };
  }
  const usesOwnPk = /ownPublicKey\s*\(/.test(source);
  const usesAssertEq = /assert\s*\(\s*ownPublicKey\s*\(\s*\)\s*\.bytes\s*==/.test(source)
    || /assert\s*\(\s*ownPublicKey\s*\(\s*\)\s*==/.test(source);
  if (usesAssertEq) {
    return {
      ok: false,
      warning:
        'ownPublicKey() is a witness. Do not use it for caller verification. Derive identity from a secret (see docs/OWN-PUBLIC-KEY-WARNING.md and midnight-docs#902).',
    };
  }
  if (usesOwnPk) {
    return {
      ok: true,
      warning:
        'ownPublicKey() present. Confirm it is used only for routing after a separate authentication check.',
    };
  }
  return { ok: true };
}

export const INVARIANT =
  'Never authenticate a caller with ownPublicKey(); derive from a witness secret instead. Pins: Compact ~0.31.1 / language ~0.23.';
