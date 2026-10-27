# Return values from exported circuits and disclose()

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official: https://docs.midnight.network/compact/reference/explicit-disclosure

Issue #266 (opened 2026-10-21, Compact toolchain 0.31.1 / language ~0.23, also checked on 0.35.0) reports two points about explicit disclosure and circuit returns:

1. Returning a value from an exported circuit (whether a disclosed witness or a circuit argument) does **not** place that value in the published transaction bytes. The value reaches the calling DApp (`callTx.private.result`) but is absent from the transaction `raw` searched on a local network. A ledger write via `disclose` *does* appear in the transaction. The docs currently describe return as a disclosure site in the same terms as a ledger store; the observed behavior is that the return is disclosed to the DApp, not necessarily to the chain.

2. Returning a circuit argument is accepted by the compiler without `disclose()`:

```compact
export circuit f(x: Uint<64>): Uint<64> { return x; }
```

while returning a witness value is rejected unless wrapped in `disclose()`:

```compact
export circuit f(): Uint<64> { return secretNum(); }  // rejected
export circuit f(): Uint<64> { return disclose(secretNum()); }  // accepted
```

The issue assumes the argument case is intended (the caller already knows its own inputs). Map keys and branching that affect ledger writes still require `disclose()`; an `assert` on a secret does not.

Lab sample: `contracts/hello-midnight/return-value-disclose.compact` shows both the argument return (no disclose) and the witness return (with disclose).

`packages/preprod-hello-stub/src/return-value-disclose-invariant.mjs` is a source check only. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a Preprod deploy or a fix of the public indexer or node.

This lab does not claim a fix of the public docs, compiler, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
