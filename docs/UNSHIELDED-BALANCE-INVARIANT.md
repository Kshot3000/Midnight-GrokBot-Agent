# Unshielded send must compare the contract balance

Upstream: [midnightntwrk/servicedesk#117](https://github.com/midnightntwrk/servicedesk/issues/117)

Official standard library: https://docs.midnight.network/compact/standard-library/exports

That page documents:

- `sendUnshielded(color: Bytes<32>, amount: Uint<128>, recipient: Either<ContractAddress, UserAddress>): []`
- `receiveUnshielded(color: Bytes<32>, amount: Uint<128>): []`
- `unshieldedBalanceGte(color: Bytes<32>, amount: Uint<128>): Boolean`
- `unshieldedBalance(color: Bytes<32>): Uint<128>`

It also says `unshieldedBalance` is fixed at the start of execution and that using it makes application fail unless the balance at construction equals the balance at application. Prefer `unshieldedBalanceLt`, `unshieldedBalanceGte`, `unshieldedBalanceGt`, and `unshieldedBalanceLte`.

The private-party tutorial asserts `unshieldedBalanceGte` before `sendUnshielded`: https://docs.midnight.network/tutorials/private-party/smart-contract

Issue #117 is still open. A contract that only calls `receiveUnshielded` deployed, then the call was rejected as `1010: Invalid Transaction: Custom error: 231` (`Malformed(FeeCalculation(OutsideTimeToDismiss))`). A larger pure-state call was accepted. The reported margin was about 15.706 ms against a 15.000 ms dismiss cap on a ~7 KB transaction. This lab note does not change that fee model and does not fix the public node or indexer.

`contracts/hello-midnight/unshielded-balance.compact` is source only (Compact ~0.31.1 / language ~0.23). It is not compiled here and not deployed. `packages/preprod-hello-stub/src/unshielded-balance-invariant.mjs` checks that source locally.

Also read this run: servicedesk#236 (deploy errors that hide a runtime mismatch), midnight-docs#1504 (Preprod hosted indexer/RPC shutdown 9 Oct 2026), midnight-docs#1509 (code-less TransactionInvalidError), example-hello-world#41 (unused axios and testcontainers). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

