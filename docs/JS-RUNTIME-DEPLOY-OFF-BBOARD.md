# JavaScript runtime and deploy guides still use the bulletin board contract

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1579

midnight-docs#1579 says `midnightntwrk/example-bboard` is going to be archived, so the docs should stop linking to it. PR 1578 retires the bboard tutorial and removes the repo links it touched. Two guides still use the bulletin board contract as their worked example from start to finish, so they need a new example rather than a link swap.

Affected pages (checked live 2026-10-20):

- https://docs.midnight.network/guides/compact-javascript-runtime — compiles bboard.compact, imports from `./managed/bboard/contract/index.js`, uses `localSecretKey` / `BBoardPrivateState`, and the unit test suite against the bulletin board asserts.
- https://docs.midnight.network/guides/deploy-and-operate — `BBoardProviders`, `'post' | 'takeDown'`, `NodeZkConfigProvider` path to managed/bboard, `BBoardWalletProvider`, and deploy/call scripts all bboard-specific. Links https://github.com/midnightntwrk/example-bboard.

This lab does not edit midnight-docs, does not archive the example repo, and does not claim a public indexer or node fix. Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## What builders should do while the rewrite is open

Prefer a maintained contract for new work. The official support matrix and installation page still pin Compact toolchain 0.31.1 / language ~0.23 for public networks. The hello-world example (https://github.com/midnightntwrk/example-hello-world) and the local-network guides remain valid starting points. Do not invent circuit names or provider shapes; copy the pattern from the still-live guide, then rename to your own contract.

The pure-circuit and assert patterns in the JavaScript runtime guide match the Compact reference (https://docs.midnight.network/compact/reference/compact-reference) and the explicit-disclosure page. Circuit calls return `result`, `context`, `proofData`, and `gasCost`. Do not pass a hand-built `{ privateState, ledgerState }` as context; use `createCircuitContext` from the runtime.

## Lab check

`packages/preprod-hello-stub/src/js-runtime-deploy-rewrite.mjs` classifies the two guide URLs as still bboard-based until #1579 is done, and points at the official pages. `contracts/hello-midnight/js-runtime-deploy-note.compact` is a source note only (pragma language_version >= 0.23, no new APIs). LOCAL-TRUE. No deploy is claimed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
