# JavaScript runtime and deploy guides still sample bulletin board

Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1579

midnight-docs#1579 asks to rewrite `docs/guides/compact-javascript-runtime.mdx` and `docs/guides/deploy-and-operate.mdx` off the bulletin board contract. `midnightntwrk/example-bboard` is planned for archival. PR #1578 retires the bboard tutorial pages; these two guides still use the contract as their full worked example, so a link swap is not enough.

This lab note only classifies the gap. It does not edit midnight-docs, claim a public indexer or node fix, or invent APIs. Pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0. Official docs only: https://docs.midnight.network/.

## What the official pages still do

Checked live on 2026-10-21:

- https://docs.midnight.network/guides/compact-javascript-runtime links to https://github.com/midnightntwrk/example-bboard and compiles `bboard.compact`. Imports, witnesses (`localSecretKey`, `BBoardPrivateState`), and the unit test suite are written against that contract.
- https://docs.midnight.network/guides/deploy-and-operate links to the same repo. Provider types (`BBoardProviders`, `'post' | 'takeDown'`), store names, `NodeZkConfigProvider` paths, and the deploy/call scripts are bboard-specific.

The published hello-world getting-started page already shows a minimal contract that matches the pin:

```
pragma language_version 0.23;

export ledger message: Opaque<"string">;

export circuit storeMessage(newMessage: Opaque<"string">): [] {
  message = disclose(newMessage);
}
```

Source: https://docs.midnight.network/getting-started/hello-world. Circuit arguments are private; `disclose()` is required for the public ledger write. That is the replacement shape the issue points toward (a maintained tutorial contract, not bulletin board).

## Lab check

`contracts/hello-midnight/js-runtime-deploy-note.compact` is a source-only note that records the rewrite need. It does not declare the full bulletin board surface.

`packages/preprod-hello-stub/src/js-runtime-deploy-gap.mjs` classifies the two guide paths as still-using-bboard and recommends the hello-world page. `node --test test/js-runtime-deploy-gap.test.mjs` covers it. LOCAL-TRUE. No deploy is claimed.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
