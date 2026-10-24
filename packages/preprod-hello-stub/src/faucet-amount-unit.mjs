/**
 * Lab note: faucet amount unit (servicedesk#254).
 * Official guides document 5,000 tNIGHT per drip.
 * POST /drips multiplies amount by TNIGHT_UNIT (5_000_000 STAR).
 * Do not invent APIs. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const FAUCET_DRIP_TNIGHT = 5000n;
export const TNIGHT_UNIT_STAR = 5_000_000n;

/** Decode a raw STAR amount from a drip into tNIGHT. */
export function starToTNight(star) {
  return star / 1_000_000n;
}

/** Expected drip size in STAR for the documented 5,000 tNIGHT. */
export function expectedDripStar() {
  return FAUCET_DRIP_TNIGHT * 1_000_000n;
}
