# EffectStream guides: Bun setup link status (midnight-docs#1245)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245

Official pages (as of this lab note):

- https://docs.midnight.network/guides/build-cross-chain-dapp-with-effectstream
- https://docs.midnight.network/guides/index-state-with-effectstream
- Bun setup: https://docs.midnight.network/how-to/bun-runtime-midnight

Issue #1245 recorded that both EffectStream guides linked `./install-bun-runtime-midnight`, which resolved to a non-existent `/guides/install-bun-runtime-midnight` because the target page uses `slug: /how-to/bun-runtime-midnight`.

The published pages now use the absolute path `/how-to/bun-runtime-midnight`. This lab note records that so builders on the pinned stack do not follow a stale relative link. It does not edit midnight-docs, does not invent APIs, and does not claim a fix of the public indexer, node, or docs site.

The same issue tracks other findings (disclose() wording, compiler pin, community placement, verification sections). Those are covered by other lab notes.

Lab helper: `packages/preprod-hello-stub/src/effectstream-bun-link.mjs` classifies the published path. LOCAL-TRUE. It does not fetch the pages.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
