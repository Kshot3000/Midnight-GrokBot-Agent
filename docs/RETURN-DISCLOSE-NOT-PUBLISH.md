# Return from an exported circuit is not on-chain publication

Upstream: [midnightntwrk/servicedesk#266](https://github.com/midnightntwrk/servicedesk/issues/266)

Official page: https://docs.midnight.network/compact/reference/explicit-disclosure

The page requires a Compact program to declare disclosure "before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract" and states that "disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit."

Local tests reported in the issue (compiler 0.31.1 / language 0.23, ledger 8, midnight-js 4.1.1, proof-server 8.1.0) show a distinction:

- Returning a circuit argument (`return x;`) compiles without `disclose()`. The caller already knows the argument.
- Returning a witness value requires `disclose()`. The compiler rejects the bare return.
- A returned value (whether a disclosed witness or an argument) reaches the calling DApp (`tx.private.result`) but is not present in the published transaction `raw` bytes.
- A ledger write of `disclose(value)` is present in the published transaction.

The right reading of the official text is that `disclose()` on a return clears the compiler check so the value may leave the circuit and reach the DApp. It does not mean the value is written into the on-chain transaction the way a ledger assignment is. Contract-to-contract calls were not tested on ledger 8 in the report.

This lab does not edit the public docs or claim to fix the public indexer or node.

## Lab source

`contracts/hello-midnight/return-disclose-not-publish.compact` pins `pragma language_version >= 0.23` (Compact ~0.31.1).

- `returnArg` returns the argument without `disclose()`.
- `returnWitness` returns `disclose(secretValue())`.
- `storeArg` writes `stored = disclose(x)`.

`packages/preprod-hello-stub/src/return-disclose-not-publish-invariant.mjs` is a source check. It does not run the Compact compiler and does not deploy.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
