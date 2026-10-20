# Bulletin board tutorial retirement plan (docs still live)

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1577

midnight-docs#1577 plans to retire the bulletin board tutorial and the bboard Examples DApp page. Every retired URL is meant to redirect to the tutorials landing page, and inbound links are to be repointed there. The issue follows the same pattern as the Counter retirement in midnight-docs#1021 (done in midnight-docs#1028).

This lab note only classifies those paths. It does not edit midnight-docs, claim a public indexer or node fix, or invent APIs. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## Paths the issue retires

Checked live on 2026-10-20. These pages still serve content until the retirement PR lands:

- https://docs.midnight.network/tutorials/bboard
- https://docs.midnight.network/tutorials/bboard/smart-contract
- https://docs.midnight.network/tutorials/bboard/bboard-cli
- https://docs.midnight.network/tutorials/bboard/bboard-api-implementation
- https://docs.midnight.network/tutorials/bboard/bboard-cli-implementation
- https://docs.midnight.network/examples/dapps/bboard

After the issue is done, each should redirect to https://docs.midnight.network/tutorials. The tutorials landing still lists a Bulletin board tile today.

## What stays (out of scope in the issue)

The issue leaves these alone:

- The `midnightntwrk/example-bboard` GitHub repo: https://github.com/midnightntwrk/example-bboard
- `create-mn-app --template bboard` (still the default template)
- GitHub links in quickstart, compact-javascript-runtime, and deploy-and-operate that point at the repo, not the docs page
- Release notes and historical blog posts

Builders who need the Compact contract should use the example repo or the still-live examples page, not wait on the tutorial folder. The examples page publishes the contract with `pragma language_version 0.23;` and the three asserts:

- `Attempted to post to an occupied board`
- `Attempted to take down post from an empty board`
- `Attempted to take down post, but not the current owner`

Those match the earlier decode in `docs/BBOARD-ASSERT-DECODE.md` (midnight-docs#1487). The examples page still starts `midnightntwrk/proof-server:8.0.3`; install docs pin 8.1.0.

## Lab check

`packages/preprod-hello-stub/src/bboard-tutorial-retirement.mjs` maps the six retired paths to `/tutorials`, marks them as still-live until the PR, and keeps the GitHub example and the create-mn-app template as valid. `node --test test/bboard-tutorial-retirement.test.mjs` covers it. LOCAL-TRUE. No deploy is claimed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
