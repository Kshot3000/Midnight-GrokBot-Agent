import { describe, it, expect } from "vitest";
import { decodeMalformedDeploy174 } from "../src/malformed-deploy-174-decode.mjs";

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

describe("decodeMalformedDeploy174", () => {
  it("matches Custom error 174", () => {
    const r = decodeMalformedDeploy174("1010: Invalid Transaction: Custom error: 174");
    expect(r.kind).toBe("malformed-contract-deploy-174");
  });

  it("matches the name MalformedContractDeploy", () => {
    const r = decodeMalformedDeploy174("MalformedContractDeploy: non-zero balance");
    expect(r.kind).toBe("malformed-contract-deploy-174");
  });

  it("ignores unrelated 1010", () => {
    const r = decodeMalformedDeploy174("1010: Invalid Transaction: Custom error: 170");
    expect(r.kind).toBe("not-174");
  });

  it("ignores empty", () => {
    const r = decodeMalformedDeploy174("");
    expect(r.kind).toBe("not-174");
  });
});
