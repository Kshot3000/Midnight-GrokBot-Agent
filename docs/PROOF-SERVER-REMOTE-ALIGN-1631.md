# Proof server remote proving advice alignment (lab note)

Upstream: [midnightntwrk/midnight-docs#1631](https://github.com/midnightntwrk/midnight-docs/issues/1631)  
Official sources only (no invented APIs):

- [Proving transactions locally](https://docs.midnight.network/guides/local-proving) (recommends local proving; remote not recommended outside a TEE)
- [Run the proof server](https://docs.midnight.network/guides/run-proof-server) (still allows "a remote machine that you control")

## Documented discrepancy (as of 2026-10-31)

The local-proving guide (pinned around proof-server 8.1.3, Compact ~0.31.1, midnight-js 4.1.1, DApp Connector 4.0.1) states that a proof server anywhere else is a remote proof server and that the Midnight Foundation doesn't recommend one outside a trusted execution environment (TEE), because the proof server receives private witness data, coin secrets, and DUST keys in the clear, has no authentication or TLS, and logs request bodies when verbose.

The run-proof-server page still says: "To protect your data, you should access only a local proof server, or perhaps one on a remote machine that you control, over an encrypted channel." It also describes outbound requests as one at startup, while local-proving notes additional parameter fetches for new circuit sizes.

This lab note records the current official text so builders can prefer the local-proving guidance when the pages disagree. It does not change public docs, does not invent a TEE API, and does not claim to fix the public indexer or node.

See also the pinned versions in the support matrix and local-proving prerequisites.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
