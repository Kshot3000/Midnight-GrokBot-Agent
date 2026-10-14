# Stagenet rejects proof-server 9.0.0-rc.9 DUST-spend proofs with 1010 Custom error 170

Upstream: [midnightntwrk/servicedesk#252](https://github.com/midnightntwrk/servicedesk/issues/252)

Observed on Midnight Stagenet (node 2.0.0-d9729c13, specVersion 2000000): transactions proved by proof-server 9.0.0-rc.9 are rejected with

```text
1010: Invalid Transaction: Custom error: 170
```

The same wallet, contract, and transaction shape proved by 9.0.0-rc.5 finalize. Error 170 is reported as InvalidDustSpendProof. The contract-call proof itself is not the failure point.

This lab pins proof-server **8.1.0** (with Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1). It does not claim to fix the public node, indexer, or proof-server image. The note is only a classification aid for builders hitting the same surface while the compatibility of the 9.x RCs is clarified.

Official docs remain the source of truth for supported versions: https://docs.midnight.network/relnotes/support-matrix

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
