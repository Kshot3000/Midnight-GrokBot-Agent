# Pure circuits in contract types compile but every call is refused

Upstream: [midnightntwrk/servicedesk#249](https://github.com/midnightntwrk/servicedesk/issues/249)

Official reference: [ModuleResolutionFailure](https://docs.midnight.network/api-reference/compact-runtime/type-aliases/ModuleResolutionFailure) documents the `PureInterfaceCircuit` kind:

> The contract type declares the called circuit `pure`, so it has no verifier key and is never a deployed operation. The compiler accepts the declaration and the call, so this is where one stops. TODO: reject the declaration at compile time instead.

CoIP 2 currently lists `pure` circuits in contract type declarations as supported. With compactc ~0.31.1 / 0.35.0 the declaration compiles (including ZKIR and keys), but every call through the type fails at runtime with `ModuleResolutionError` kind `PureInterfaceCircuit`. CoIP 4's list of failure kinds omits it.

Lab invariant: `contracts/hello-midnight/no-pure-interface.compact` keeps pure circuits as ordinary helpers and never places them inside a contract type used for a cross-contract call. The decoder in `packages/preprod-hello-stub/src/pure-interface-invariant.mjs` recognises the runtime error text when it appears.

It does not patch the compiler, does not claim a public contract deploy, and does not fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/pure-interface-invariant.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
