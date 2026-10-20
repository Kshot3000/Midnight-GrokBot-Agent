// Local classifier for the official assert-on-private rule.
// Official: https://docs.midnight.network/compact/explicit_disclosure
// Upstream related: https://github.com/midnightntwrk/midnight-docs/issues/1487
// Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
// LOCAL-TRUE. Does not compile Compact or call a proof server.

export const ASSERT_PRIVATE_RULE = {
  official: "https://docs.midnight.network/compact/explicit_disclosure",
  summary:
    "Private data used only inside an assert subexpression does not require disclose(). Ledger writes, exported returns, and cross-contract arguments still do.",
  sample: "contracts/hello-midnight/assert-private-ok.compact",
  pins: {
    compact: "~0.31.1",
    language: "~0.23",
    midnightJs: "4.1.1",
    proofServer: "8.1.0",
  },
};

export function classifyAssertPrivate(source) {
  if (typeof source !== "string") return { ok: false, reason: "not a string" };
  const hasAssert = /assert\s*\(/.test(source);
  const hasDiscloseOnAssert = /assert\s*\(\s*disclose\s*\(/.test(source);
  const hasLedgerDisclose = /=\s*disclose\s*\(/.test(source);
  return {
    ok: hasAssert && !hasDiscloseOnAssert && hasLedgerDisclose,
    hasAssert,
    hasDiscloseOnAssert,
    hasLedgerDisclose,
    note: "Matches the lab sample pattern: assert on private, disclose only at ledger write.",
  };
}

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
