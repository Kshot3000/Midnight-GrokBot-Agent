// Preprod faucet amount unit decoder for the reported POST /drips behavior.
// Upstream: https://github.com/midnightntwrk/servicedesk/issues/254
// Official: https://docs.midnight.network/guides/acquire-tokens
//           https://docs.midnight.network/guides/networks-and-environments
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
// LOCAL-TRUE. Does not call the faucet or any network. Does not invent APIs.

export const FAUCET_AMOUNT_UNIT = {
  upstream: "https://github.com/midnightntwrk/servicedesk/issues/254",
  officialConfirm: "https://docs.midnight.network/guides/acquire-tokens",
  officialNetworks: "https://docs.midnight.network/guides/networks-and-environments",
  summary:
    "Official funding guides confirm 5,000 tNIGHT per faucet request. Issue #254 reports that POST /drips multiplies the requested amount by an internal unit of 5 tNIGHT (5_000_000 STAR), so amount \"1000\" yields the documented 5,000 tNIGHT.",
  starPerTNight: 1_000_000n,
  reportedUnitStar: 5_000_000n, // 5 tNIGHT
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    dappConnector: "4.0.1",
    proofServer: "8.1.0",
  },
};

/**
 * Decode a requested amount string under the unit reported in servicedesk#254.
 * Does not perform a network call.
 * @param {string|number} requested
 * @returns {{ ok: boolean, requested?: bigint, star?: bigint, tNight?: bigint, matchesOfficialConfirm?: boolean, note: string }}
 */
export function decodeFaucetAmount(requested) {
  const n = typeof requested === "string" ? BigInt(requested.trim() || "0") : BigInt(requested);
  if (n < 0n) {
    return { ok: false, note: "negative amount" };
  }
  const star = n * FAUCET_AMOUNT_UNIT.reportedUnitStar;
  const tNight = star / FAUCET_AMOUNT_UNIT.starPerTNight;
  const matchesOfficialConfirm = tNight === 5000n;
  return {
    ok: true,
    requested: n,
    star,
    tNight,
    matchesOfficialConfirm,
    note: matchesOfficialConfirm
      ? "Matches the official confirmation of 5,000 tNIGHT per full request."
      : "Under the reported unit this request yields a different tNIGHT amount than the page's usual 5,000 confirmation.",
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
