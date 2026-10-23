# Prove path: missing built-in key when ZKIR is unreadable

Upstream: [midnightntwrk/servicedesk#243](https://github.com/midnightntwrk/servicedesk/issues/243)

Official:

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors

Issue #243 reports that `@midnight-ntwrk/midnight-js-http-client-proof-provider` 4.1.1 (and 5.0.0-rc.4) never reads the proof-server response body. On a 400 the only message a builder sees is:

```
Failed Proof Server response: url="…/check", code="400", status="Bad Request"
```

The body is the only place the server names the reason. On proof-server 8.x it is often simply `bad input`. From 9.0.0-rc.9 it carries the detail, for example:

```
bad input: `couldn't find built-in key increment`
```

That string appears when the circuit's ZKIR was not sent or could not be read (zk-config provider error, missing keys directory, or a path that the proving provider cannot open). With `MIDNIGHT_PROOF_SERVER_VERBOSE=true` the 8.x container log shows the same `BadInput("couldn't find built-in key …")`.

This lab does not call the proof server, does not invent an API, and does not claim the public proof-server, indexer, or node is fixed. It only classifies the shape so a builder knows to check the ZKIR before retrying.

## Lab decoder

`packages/preprod-hello-stub/src/prove-path-missing-key-decode.mjs` exports `decodeMissingKeyProvePath`. It recognizes the circuit name when the reason string is present and flags a dropped-body 400 as a possible missing-key case. Run it directly for the sample inputs.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
