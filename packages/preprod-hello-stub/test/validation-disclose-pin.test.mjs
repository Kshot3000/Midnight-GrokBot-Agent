import { describe, it, expect } from "vitest";
import { classifyValidationSample } from "../src/validation-disclose-pin.mjs";

/*
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const STALE = `
export circuit transfer(recipient: Bytes<32>, amount: Uint<64>): [] {
  assert(recipient != Bytes<32>{}, "Invalid recipient");
  balance = balance - amount;
}
`;

const FIXED = `
export circuit transfer(recipient: Bytes<32>, amount: Uint<64>): [] {
  assert(recipient != default<Bytes<32>>, "Invalid recipient");
  balance = disclose(balance - amount);
}
`;

describe("validation disclose pin", () => {
  it("flags the stale Bytes{} sample", () => {
    const r = classifyValidationSample(STALE);
    expect(r.stale).toBe(true);
    expect(r.reasons.join(" ")).toMatch(/Bytes<32>\{\}/);
  });

  it("accepts the disclose/default shape", () => {
    const r = classifyValidationSample(FIXED);
    expect(r.stale).toBe(false);
    expect(r.reasons).toEqual([]);
  });
});
