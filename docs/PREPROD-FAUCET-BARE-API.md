# Preprod faucet: do not request bare /api

Upstream: [midnightntwrk/servicedesk#193](https://github.com/midnightntwrk/servicedesk/issues/193)

Open issue: the Preprod faucet server crashes on a bare `/api` request because `router.ts:75` uses a regex match without a null check. Labels on the ticket include `component:faucet` and `network:preprod`. This lab cannot push a fix to that service.

Official funding path is the faucet UI, not a JSON API this repo invents:

- https://docs.midnight.network/relnotes/network lists Preprod faucet UI `https://midnight-tmnight-preprod.nethermind.dev/`
- https://docs.midnight.network/guides/acquire-tokens tells builders to open that UI, paste an unshielded address, and complete the captcha

`packages/preprod-hello-stub/src/faucet-path-guard.mjs` refuses a request path of `/api` before any fetch. `attempt-faucet.mjs` calls that check on the URL it would POST. The existing drip path in `preprod-config.mjs` is `/drips`, which is not the crashing path. A captcha-less run still fails clearly and does not claim funding.

This note does not fix the public faucet, indexer, or node. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
