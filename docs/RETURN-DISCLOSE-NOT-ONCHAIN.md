# Returned disclose() values reach the DApp, not the published transaction

Upstream: https://github.com/midnightntwrk/servicedesk/issues/266

Official docs only:
- Explicit disclosure: https://docs.midnight.network/compact/reference/explicit-disclosure
- Support matrix: https://docs.midnight.network/relnotes/support-matrix (Compact toolchain 0.31.1, runtime 0.16.0)

The official page states that a Compact program must declare disclosure "before storing it in the public ledger, returning it from an exported circuit, or passing it to another contract" and that "disclosure does not occur just when witness data is stored in the ledger but also when returned from an exported circuit."

servicedesk#266 reports empirical results on a local network (Compact 0.31.1 / language 0.23, ledger 8, proof-server 8.1.0, midnight-js 4.1.1):

- A value stored with `stored = disclose(x)` appears in the published transaction `raw` bytes.
- A value returned with `return disclose(secretValue())` or `return x` reaches `callTx.private.result` but is absent from the published transaction bytes.

The issue also reports that returning a circuit argument compiles without `disclose()` on toolchain 0.31.1, while returning a bare witness value is rejected.

This lab note records the documented requirement and the reported distinction. It does not invent APIs, does not call public endpoints, and does not claim a fix to the public indexer, node, compiler, or docs.

Lab sample: `contracts/hello-midnight/return-disclose.compact` shows the documented `disclose()` on a witness return and the reported acceptance of a bare argument return.

Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
