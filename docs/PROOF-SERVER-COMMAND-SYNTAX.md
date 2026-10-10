# Proof server Docker command syntax and healthcheck

Upstream: [midnightntwrk/example-hello-world#16](https://github.com/midnightntwrk/example-hello-world/issues/16)

On a fresh WSL2 setup the example compose used `command: ['midnight-proof-server -v']` (one string) and a healthcheck that called `curl`. Docker treats a single-string command as the executable name, so the server does not start cleanly. The `midnightntwrk/proof-server` image is minimal and does not include `curl`, so the healthcheck marks the container unhealthy even when the process is listening.

The official local proving guide shows the working form for the pinned image `midnightntwrk/proof-server:8.1.0`:

```yaml
services:
  proof-server:
    image: 'midnightntwrk/proof-server:8.1.0'
    command: ['midnight-proof-server', '-v']
    ports:
      - '127.0.0.1:6300:6300'
    environment:
      RUST_BACKTRACE: 'full'
    healthcheck:
      test: ['CMD-SHELL', 'echo > /dev/tcp/127.0.0.1/6300']
      interval: 10s
      timeout: 5s
      retries: 20
      start_period: 10s
```

`packages/preprod-hello-stub/src/proof-server-command.mjs` checks that a pasted command array is the two-element form and that a healthcheck does not rely on `curl`. It does not start Docker and does not claim a fix of the public indexer, node, or proof server.

Official:

- https://docs.midnight.network/guides/local-proving
- https://docs.midnight.network/guides/run-proof-server
- https://docs.midnight.network/api-reference/error-reference/proof-server-errors

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#236 (runtime mismatch messages), servicedesk#225 (RPC 1010 wrapped), midnight-docs#1509 (1010 decode), example-hello-world#41 (unused deps). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
