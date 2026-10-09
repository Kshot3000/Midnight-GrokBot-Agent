# Compact const is local; the Test and debug sample does not compile

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official const statements: [Compact reference](https://docs.midnight.network/compact/reference/compact-reference) (const creates local variable bindings inside a block or for-loop header).

Official disclosure: [Explicit disclosure](https://docs.midnight.network/compact/explicit_disclosure).

The [Test and debug](https://docs.midnight.network/compact/test-and-debug) page Compact sample does not compile against the compatibility matrix pin (Compact toolchain 0.31.1, language ~0.23, compact-runtime 0.16.0, midnight-js 4.1.1). Issue 1487 names three compile problems:

- `const` at the top level (const is a local binding, not a top-level declaration)
- `Bytes<32>{}` (not a Compact value constructor; empty `Bytes<32>` is `pad(32, "")`)
- a ledger write that needs `disclose()`

This lab does not edit midnight-docs. It does not fix the public indexer or node.

## Lab source

`contracts/hello-midnight/no-toplevel-const.compact` keeps `const` inside the circuit, builds the empty bytes with `pad(32, "")` if needed, and wraps the witness return in `disclose()` before the ledger write. Pragma is `>= 0.22 && <= 0.23`.

`packages/preprod-hello-stub/src/no-toplevel-const-invariant.mjs` is a source check. It does not run the Compact compiler. Run:

```bash
cd packages/preprod-hello-stub
node src/no-toplevel-const-invariant.mjs
```

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (runtime mismatch messages), servicedesk#225 (RPC 1010 wrapped), midnight-docs#1509 (code-less TransactionInvalidError), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
