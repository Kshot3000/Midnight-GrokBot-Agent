/*
 * validation-disclose-pin.mjs — flag the stale transfer sample from the
 * Test and debug page so a builder can tell it from the disclosed shape.
 *
 * Official:
 *   https://docs.midnight.network/compact/test-and-debug
 *   https://docs.midnight.network/compact/reference/explicit-disclosure
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Does not call the compiler, midnight-js, or a proof server.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const STALE_MARKERS = [
  "Bytes<32>{}",
  "balance = balance - amount",
];

export const FIXED_MARKERS = [
  "default<Bytes<32>>",
  "disclose(balance - amount)",
];

/**
 * @param {string} source
 * @returns {{ stale: boolean, reasons: string[] }}
 */
export function classifyValidationSample(source) {
  const text = String(source ?? "");
  const reasons = [];
  for (const m of STALE_MARKERS) {
    if (text.includes(m)) reasons.push(`stale marker: ${m}`);
  }
  const hasFixed = FIXED_MARKERS.every((m) => text.includes(m));
  return {
    stale: reasons.length > 0 || !hasFixed,
    reasons: reasons.length ? reasons : hasFixed ? [] : ["missing disclose/default shape"],
  };
}
