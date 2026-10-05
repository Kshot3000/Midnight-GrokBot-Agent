# Callee cannot read kernel.caller on the public pin

Upstream: [midnightntwrk/servicedesk#202](https://github.com/midnightntwrk/servicedesk/issues/202)

Open Compact compiler report: a callee cannot read its caller because `kernel.caller` is undefined, and the calling entry point is not carried in `CallContext`.

Official release notes for Compact toolchain 0.35.0 (language 0.27.0, 29 September 2026) add `kernel.caller()` and `PublicAddress`, and say to read the caller only where the call is known to come from a contract. That release targets ledger 9, which is not deployed on the public networks. The same page says to use `compact update 0.31` for contracts deployed today: https://docs.midnight.network/relnotes/compact

This lab stays on Compact ~0.31.1 / language >= 0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. It does not call `kernel.caller()`. It does not invent a cross-contract call API. The source workaround is `contracts/hello-midnight/explicit-callee.compact`:

- `registerCaller` asserts the ledger slot is empty, then writes `disclose(persistentHash(...))`. `disclose()` only clears the compiler private-data check; the ledger write is what publishes the commitment (https://docs.midnight.network/compact/explicit_disclosure).
- `acceptFromCaller` takes an explicit `Bytes<32>` argument and asserts it matches the registered commitment and the witness. That is a stand-in for the missing caller read, not a protocol check of the signing wallet.

`packages/preprod-hello-stub/src/callee-caller-invariant.mjs` checks that source. It does not compile Compact and does not claim a public indexer or node fix.

Also still open on this sweep: servicedesk #230 (1AM Preprod indexer tip lag), #225 (RPC 1010 hidden by `Transaction submission error`), #226 (no subset deploy), #223 (Preprod `chain_getHeader` head goes backwards), midnight-docs #902 (`ownPublicKey()` warning missing on regenerated pages), example-hello-world #41 (unused axios and testcontainers).

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
