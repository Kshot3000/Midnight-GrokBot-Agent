# Compact pragma form still disagrees across official pages

Upstream: [midnightntwrk/midnight-docs#1387](https://github.com/midnightntwrk/midnight-docs/issues/1387)

Compact copy: [LFDT-Minokawa/compact#833](https://github.com/LFDT-Minokawa/compact/issues/833)

Official grammar, read 2026-10-07: https://docs.midnight.network/compact/reference/compact-grammar

A pragma is `pragma id version-expr ;`. A version atom is a natural, a `nat.nat` pair, or a `nat.nat.nat` trio. Comparison operators `<`, `<=`, `>=`, `>`, and `!` are in the grammar. The Compact reference repeats that rule: https://docs.midnight.network/compact/reference/compact-reference

Issue #1387 records Kapa questions the Compact reference did not answer, including the pragma form. The follow-up on compact#833 is still open. Official pages still show three different strings:

| Page | String |
| --- | --- |
| https://docs.midnight.network/compact/reference/writing | `pragma language_version 0.16;` |
| https://docs.midnight.network/troubleshoot/compiler-errors | `pragma language_version >= 0.23;` |
| https://docs.midnight.network/guides/security-best-practices | `pragma language_version 0.23.0;` |

The bulletin board sample uses the pair form this lab pins: `pragma language_version 0.23;` at https://docs.midnight.network/examples/dapps/bboard

`contracts/hello-midnight/pragma-form.compact` uses that pair. `packages/preprod-hello-stub/src/pragma-form.mjs` classifies a pasted pragma against those pages. It does not run `compactc`, does not invent a compiler rejection of the trio form, and does not change the public indexer or node.

Lab pins stay Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Also read this run: servicedesk#223 (preprod RPC head goes backwards), servicedesk#236 (deploy errors that hide a runtime mismatch), example-hello-world#13 (proof-server image 8.1.0 vs 8.1.3 on the renovate dashboard). None of those are fixed here.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
