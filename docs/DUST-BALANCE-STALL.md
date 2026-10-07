# DUST balance stall before submit

Upstream: [midnightntwrk/servicedesk#194](https://github.com/midnightntwrk/servicedesk/issues/194)

Wallet facade balancing can pin CPU and grow RSS before submission. Maintainer triage on that issue says the hang is the dust leg of `WalletFacade.balanceUnboundTransaction()`, inside `computeBalancingRecipe`, which iterates with no cap. A later pass treats an unsigned fee as a surplus, selects zero coins, and never returns. It is not an `InsufficientFundsError`. The open fix is [midnight-wallet#741](https://github.com/midnightntwrk/midnight-wallet/pull/741). It is not in a published release this lab depends on.

Official method names used here are the documented facade calls only:

- https://docs.midnight.network/api-reference/wallet-sdk
- `balanceUnboundTransaction`
- `balanceFinalizedTransaction`
- `finalizeRecipe`

Lab helper: `packages/preprod-hello-stub/src/dust-balance-stall.mjs`

- `classifyBalanceObservation` marks a silent deadline, a zero-coin pass, or large RSS growth as a stall.
- A named `InsufficientFundsError` is not that stall.
- `withBalanceDeadline` rejects when the balance promise does not settle. It does not call wallet-sdk, the public indexer, or a node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. This is not a wallet-sdk release and not a public indexer or node fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
