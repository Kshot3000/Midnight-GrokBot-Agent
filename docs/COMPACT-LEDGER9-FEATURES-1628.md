# Compact reference and standard library omit which features need ledger 9 (midnight-docs#1628)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1628

Official pages (do not invent APIs):

- https://docs.midnight.network/relnotes/support-matrix
- https://docs.midnight.network/compact/reference/compact-reference
- https://docs.midnight.network/compact/standard-library/exports
- https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
- https://docs.midnight.network/getting-started/hello-world

## Gap

The Compact language reference and standard-library exports pages describe constructs that target Compact language 0.27.0 / toolchain 0.35.0. Those toolchains compile for ledger 9.

Preview, Preprod, and Mainnet run ledger 8. The support matrix pairs them with Compact toolchain 0.31.1 (language ~0.23) and Compact runtime 0.16.0. Known incompatible combinations state that toolchains 0.34.0 / 0.35.0 and runtimes 0.19.0 / 0.20.0 target ledger 9 and do not work with the matrix pins.

Nothing on the reference or exports pages states which identifiers (`jubjubSchnorrVerify`, `keccak256`, `sha512`, events, etc.) are only available after the ledger 9 fork. A builder who copies a 0.27.0 construct into a contract that must deploy on Preprod receives an unbound-identifier or version-mismatch error.

The hello-world tutorial correctly uses `pragma language_version 0.23;`.

## Lab pin

`contracts/hello-midnight/ledger9-feature-pin.compact` is a source-only sample that stays on language 0.23 and uses only ledger-8-safe standard-library operations (no ledger-9 identifiers). LOCAL-TRUE. Not compiled or deployed here.

This lab does not patch midnight-docs, does not claim a fix of the public indexer or node, and does not invent Compact APIs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
