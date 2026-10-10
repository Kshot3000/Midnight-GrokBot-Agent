# Extra official LedgerApiError u8 names for Custom error: N

Upstream: [midnightntwrk/midnight-docs#1385](https://github.com/midnightntwrk/midnight-docs/issues/1385)

Official: [Node error codes](https://docs.midnight.network/nodes/error-codes)

The node error codes page lists LedgerApiError values as u8 (0–255). Five-digit codes such as 10999 are not in those tables. This lab still does not invent a name for 10999. It only copies additional documented u8 names so a Preprod 1010 `Custom error: N` string can be labeled without opening the page.

Added from the official tables:

- 100 EffectsMismatch
- 101 ContractAlreadyDeployed
- 102 ContractNotPresent
- 104 Transcript
- 193 ReplayProtectionViolation

`packages/preprod-hello-stub/src/ledger-custom-expand.mjs` checks those names and keeps 10999 on the submission-layer path. It does not call the node, does not submit a transaction, and does not claim the public indexer or node is fixed.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
