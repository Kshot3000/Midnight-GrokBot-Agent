# Proving topology gap

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1383

The published local-proving guide says a proof server receives witness data, so a builder should use only a local proof server, or a remote machine they control, over an encrypted channel.

https://docs.midnight.network/guides/local-proving

Lace is documented with one proving option: Settings, Midnight, Local, `http://localhost:6300`. The same page starts the lab pin image:

```
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

The proof server does not hold wallet keys, cannot sign, and cannot spend. It does see witness data.

This lab classifier does not invent a wallet-delegated or public hosted proof-server API. Issue #1383 asks for that topology page. Until the official docs name those modes, a non-local host is treated as someone else's proof server.

The older page https://docs.midnight.network/develop/how-to/run-proof-server still shows `midnightnetwork/proof-server` and `--network testnet`. That is not the Preprod pin.

This does not fix the public indexer, node, or proof server.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
