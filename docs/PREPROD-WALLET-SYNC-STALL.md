# Preprod wallet sync stall (lab classifier)

Upstream: [midnightntwrk/midnight-docs#1381](https://github.com/midnightntwrk/midnight-docs/issues/1381)

There is no troubleshooting page for Preprod wallet sync stalls. This lab file classifies the symptoms recorded on that issue. It does not add a page to midnight-docs, does not call WalletFacade, and does not fix the public indexer or node.

## What the published pages say

- Wallet guide: `waitForSyncedState()` waits for the initial sync before balance reads. `state().isSynced` is the published gate. Sample Preprod config sets `provingServerUrl` to `http://localhost:6300` and the indexer client to `indexer.preprod.midnight.network`. https://docs.midnight.network/sdks/official/wallet-developer-guide
- Acquire tokens: a connectivity check can be true while `isSynced` is still false. A restarted script syncs again from the beginning. Registration waits on `waitForSyncedState()`. https://docs.midnight.network/guides/acquire-tokens
- Those pages do not publish an expected Preprod sync duration, a dust-history skip, or a checkpoint staleness bound for `restore()`.

## Recorded symptoms this classifier names

| Symptom on #1381 | Kind | Lab reading |
| --- | --- | --- |
| `isSynced` never becomes true after connect | `connected-not-synced` | Matches the acquire-tokens distinction. Not an indexer fix. |
| `waitForSyncedState()` hangs on Preprod | `wait-for-synced-state` | Published gate. No duration invented. |
| dust commitment tree insert is non-linear | `dust-commitment-nonlinear` | Recorded string only. No recovery API on the cited pages. |
| proof server was not running (one self-diagnosis) | `proof-server-not-in-symptom` | Sample URL is localhost:6300. Lab pin remains proof-server 8.1.0. |
| checkpoint / `restore()` staleness | `checkpoint-staleness-unpublished` | Unanswered on #1381. No bound invented. |

Indexer tip lag is a different ticket (midnightntwrk/servicedesk#230) and is not classified here.

Helper: `packages/preprod-hello-stub/src/wallet-sync-stall.mjs`

Pins used by this lab: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
