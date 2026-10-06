# Hello-world prove path does not need axios or testcontainers

Upstream: [midnightntwrk/example-hello-world#41](https://github.com/midnightntwrk/example-hello-world/issues/41)

Related: [midnightntwrk/midnight-docs#1396](https://github.com/midnightntwrk/midnight-docs/issues/1396) (Hello World as the main quick start after the Academy sunset)

Official proof server: [Install the toolchain](https://docs.midnight.network/getting-started/installation)

`example-hello-world` on `main` still lists `axios` `^1.15.0` and `testcontainers` `^11.13.0` next to midnight-js `4.1.1`. Issue 41 asks to remove both as unused. This lab cannot push to that org.

The documented local prove path does not import either package. It starts:

```
docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v
```

and talks to `http://localhost:6300` through `@midnight-ntwrk/midnight-js-http-client-proof-provider` `4.1.1`. Lace still uses that local server (DApp Connector `4.0.1` does not expose `getProvingProvider`).

`packages/preprod-hello-stub/src/hello-world-deps.mjs` classifies a package.json snapshot: it records that those two names are still listed upstream, requires the proof-provider and contracts packages, and fails if this lab package depends on `axios` or `testcontainers`. It does not install them, does not call a proof server, and does not claim a public indexer or node fix.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
