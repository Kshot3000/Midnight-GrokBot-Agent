# Test-and-debug samples do not run as written

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

The public page [Test and debug](https://docs.midnight.network/compact/test-and-debug) shows a `transfer` circuit with no `pragma language_version` and assigns the private circuit argument `amount` to public ledger `balance` without `disclose`. The [hello-world tutorial](https://docs.midnight.network/getting-started/hello-world) requires `pragma language_version 0.23;` and says a private circuit parameter cannot be stored in public state without `disclose`. The same page builds a Jest context as `{ privateState, ledgerState }` and reads `newLedgerState`. The [security guide](https://docs.midnight.network/guides/security-best-practices) builds context with `createCircuitContext` from `@midnight-ntwrk/compact-runtime` and reads `.context` from the circuit result. This lab note does not edit the public docs.

`contracts/hello-midnight/debug-sample-disclose.compact` is the bounds sample with the language pragma and `disclose(amount)`. `packages/preprod-hello-stub/src/debug-sample-gap.mjs` flags the two published gaps. It does not compile Compact, does not call proof-server 8.1.0, and does not claim a public deploy or a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (opaque deploy when the runtime is not the matrix pin), servicedesk#225 (RPC 1010 wrapped as a generic submission error), servicedesk#230 (Preprod indexer lag; not fixed here), midnight-docs#1509 (unsigned 1010 causes and code-less TransactionInvalidError), midnight-docs#1504 (Preprod Blockfrost cutoff), example-hello-world#41 (unused axios / testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
