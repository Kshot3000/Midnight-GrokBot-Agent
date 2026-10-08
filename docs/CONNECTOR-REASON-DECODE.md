# DApp Connector reason may omit the node 1010

Upstream: [midnightntwrk/midnight-docs#1509](https://github.com/midnightntwrk/midnight-docs/issues/1509)

Related: [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)

Official connector errors (pin `@midnight-ntwrk/dapp-connector-api` 4.0.1): [DApp Connector API errors](https://docs.midnight.network/api-reference/error-reference/dapp-connector-errors). `APIError` is `type: 'DAppConnectorAPIError'`, `code` one of `Disconnected`, `InternalError`, `InvalidRequest`, `PermissionRejected`, `Rejected`, and a `reason` string. `Rejected` is this request. `PermissionRejected` is a session preference. Neither is a node 1010.

Official node error codes: if a DApp submits through the DApp Connector, the wallet returns `code` and `reason`. The API does not require the wallet to include the node response. If `reason` includes `Custom error: N`, look up `N`. A missing number is not the how-to's bad signature, stale era, or wrong nonce list. Those checks are for signed extrinsics. Midnight transactions are the unsigned `send_mn_transaction` call ([decode 1010](https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors)).

`Custom error: 196` in `reason` is the documented `DustDoubleSpend` row: do not run more than one wallet instance from the same seed. The block-limit sentence with no inner u8 stays the servicedesk#225 case. This lab decoder only classifies an object the caller already has. It does not submit a transaction and does not fix the public Preprod node or indexer.

Check: `node --test test/connector-reason-decode.test.mjs` from `packages/preprod-hello-stub`.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
