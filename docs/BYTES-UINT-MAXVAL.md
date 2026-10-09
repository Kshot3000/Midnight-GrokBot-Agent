# Byte-vector conversion and convertBytesToUint maxval

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Official notes: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0

Cast table: https://docs.midnight.network/compact/reference/compact-reference

Compact toolchain 0.31.0 (language 0.23.0, runtime 0.16.0) works around erroneous proof failures from operations in branches that JavaScript did not take. Proof construction still considers both branches. Byte-vector conversions to and from Field and Uint types are on that temporary list and can enlarge the circuit. The notes say to move those operations outside conditionally executed Compact code when size matters. Public networks stay on Compact 0.31.1, not a bare `compact update`.

The language reference allows `raw as Field` for `Bytes<n>` (checked; least-significant byte first; runtime error if the field would overflow). It does not allow `Bytes` to `Uint` as a Compact cast. Generated code uses `convertBytesToUint`. In 0.31.0 that function's `maxval` parameter changed from `number` to `bigint`. A DApp that still passes a number gets a runtime type error. Pass a bigint.

`contracts/hello-midnight/bytes-uint-cast.compact` hoists `raw as Field` before the `if` and discloses the Field on the ledger write. `packages/preprod-hello-stub/src/bytes-uint-cast-invariant.mjs` checks that source and names the documented maxval fix when an error already mentions `convertBytesToUint` and a number `maxval`. It does not call the runtime, compile Compact, or submit a transaction. This note does not fix the public indexer or node.

Open issues read this run included midnightntwrk/servicedesk#236 and #225, midnightntwrk/midnight-docs#1509 and #1504, and midnightntwrk/example-hello-world#41. Those already have lab notes. This change covers the 0.31.0 byte-vector item that was still missing.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
