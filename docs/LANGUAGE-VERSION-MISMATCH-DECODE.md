# Compact language version mismatch decoder

Upstream: [midnightntwrk/midnight-docs#1487](https://github.com/midnightntwrk/midnight-docs/issues/1487)

Official: [Create your first Midnight contract](https://docs.midnight.network/getting-started/hello-world) and [Install the toolchain](https://docs.midnight.network/getting-started/installation).

The hello-world page lists this symptom:

> language version X.Y.Z mismatch (X.Y.Z is your compiler's language version, for example 0.22.0)

The number in the message is the language version your current Compact compiler supports. The contract's `pragma language_version 0.23;` is what toolchain 0.31.1 accepts. The fix on the page is:

```bash
compact update 0.31.1
```

Then recompile. midnight-docs#1487 notes that test-and-debug samples also fail when the matrix pins (including the language version) are not followed.

`packages/preprod-hello-stub/src/language-version-mismatch-decode.mjs` classifies the message and points at the official pin. It does not call the compiler, does not patch midnight-docs, and does not claim to fix the public indexer or node.

```bash
cd packages/preprod-hello-stub
node src/language-version-mismatch-decode.mjs
```

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
