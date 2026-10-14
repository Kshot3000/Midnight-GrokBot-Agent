# Domain separation for Compact hashes

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official: [Smart contract security](https://docs.midnight.network/compact/smart-contract-security) — "Best practice: Use domain separation".

Distinct domain prefixes (for example `"commitment-domain"` vs `"nullifier-domain"`) prevent a single secret from producing colliding hashes when used for different purposes. Use `persistentHash` for any value that is stored in ledger state or used for authentication.

Lab invariant: `contracts/hello-midnight/domain-separation.compact` shows the two-circuit pattern with different pads. It is not compiled in this lab and is not a deploy. It does not invent APIs; the shapes are taken from the official security page.

This note does not claim any change to the public Compact compiler, indexer, or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
