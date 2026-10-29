import { describe, it, expect } from "vitest";
import { decodeFaucetAmount, FAUCET_AMOUNT_UNIT } from "../src/faucet-amount-unit-decode.mjs";

describe("faucet amount unit decode (servicedesk#254)", () => {
  it("maps the page's amount 1000 to the official 5000 tNIGHT confirmation", () => {
    const r = decodeFaucetAmount("1000");
    expect(r.ok).toBe(true);
    expect(r.tNight).toBe(5000n);
    expect(r.star).toBe(5_000_000_000n);
    expect(r.matchesOfficialConfirm).toBe(true);
  });

  it("exposes the reported unit and official cites", () => {
    expect(FAUCET_AMOUNT_UNIT.upstream).toContain("servicedesk/issues/254");
    expect(FAUCET_AMOUNT_UNIT.officialConfirm).toContain("acquire-tokens");
    expect(FAUCET_AMOUNT_UNIT.reportedUnitStar).toBe(5_000_000n);
  });

  it("rejects a negative amount", () => {
    expect(decodeFaucetAmount(-1).ok).toBe(false);
  });
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
