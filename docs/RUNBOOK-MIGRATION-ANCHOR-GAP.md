# Runbook fact check: migration anchor still live

Upstream: [midnightntwrk/servicedesk#270](https://github.com/midnightntwrk/servicedesk/issues/270)

Official:

- https://docs.midnight.network/guides/networks-and-environments
- https://docs.midnight.network/relnotes/network

Issue #270 (opened 2026-10-24) is a chore from the servicedesk runbook fact checker. It reports that the key identifier `{#migrating-from-the-midnight-hosted-mainnet-endpoints}` is no longer found in the source of `docs/guides/networks-and-environments.mdx`. The row that depended on it described endpoints, token setup, token hygiene, each error's first fix, the funding wait, the progress interval, and full-sync time.

On the published page the section is still present:

```text
## Migrating from the Midnight-hosted endpoints
(#migrating-from-the-midnight-hosted-mainnet-endpoints)
```

The rendered heading text is now "Migrating from the Midnight-hosted endpoints" (the explicit source anchor may have been dropped, so the check no longer sees the old identifier). The section still lists the retired Preprod and Mainnet URLs, the Blockfrost replacements, and the 410 / 403 symptoms.

Builders should keep using the live official page for the migration table and token rules. This lab does not edit the upstream runbook or the public docs site, and it does not claim a fix of the public indexer or node.

Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.

Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
