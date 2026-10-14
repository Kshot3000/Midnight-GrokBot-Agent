# More LedgerApiError codes from the official error-codes page

Upstream open issues that surface opaque 1010 / Custom error strings:
- [midnightntwrk/servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225)
- [midnightntwrk/servicedesk#252](https://github.com/midnightntwrk/servicedesk/issues/252) (Custom error 170)

Official source (copied names and short descriptions only):
https://docs.midnight.network/nodes/error-codes

The decoder in `packages/preprod-hello-stub/src/rpc-errors.mjs` already mapped a subset. This run adds the following codes that appear on that page and were missing:

- 105 InsufficientClaimable
- 107 VerifierKeyAlreadyPresent
- 108 ReplayCounterMismatch
- 110 VerifierKeyNotSet
- 112 VerifierKeyTooLarge
- 118 FallibleWithoutCheckpoint
- 171 OutOfDustValidityWindow
- 175 IntentSignatureVerificationFailure

It still does not invent names for codes absent from the official tables, does not change the public node or indexer, and does not claim a fix for any upstream issue. Pins remain Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
