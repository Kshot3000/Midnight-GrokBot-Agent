# Community gaps — Cardano partner chain / Midnight

What this lab can help with, and what only the Midnight node and indexer teams can fix.
Checked 2026-10-04 against open `midnightntwrk/servicedesk` issues. No invented APIs.

## Builders can use today

| Need | Where |
| --- | --- |
| Public counter plus private note commitment | `contracts/hello-midnight/hello.compact` |
| Confirmed Preprod `increment` | `docs/PREPROD-HELLO-DEPLOY.md` — contract `bfbe9b7b17f23bf85513d3d2b05f7a020c2ffd836b22f50a0097d7530e6d87f9` |
| Milestone escrow skeleton, not deployed | `contracts/agent-escrow/src/agent-escrow.compact` |
| RPC 1010 / indexer-stall decoder | `packages/preprod-hello-stub/src/rpc-errors.mjs` |

## Upstream, still open

| Issue | Why it hurts | Who can fix it |
| --- | --- | --- |
| [servicedesk#230](https://github.com/midnightntwrk/servicedesk/issues/230) | 1AM Preprod indexer stalled about 27k blocks behind the public node | Indexer team |
| [servicedesk#225](https://github.com/midnightntwrk/servicedesk/issues/225) | Node RPC 1010 block-limit rejection surfaces as a generic submission error | Wallet SDK / node error mapping |
| [servicedesk#223](https://github.com/midnightntwrk/servicedesk/issues/223) | Public Preprod RPC head can go backwards between calls | Node / RPC |
| [servicedesk#216](https://github.com/midnightntwrk/servicedesk/issues/216) | Official Preprod indexer skipped event ids 989781–989802 | Indexer team |
| [servicedesk#226](https://github.com/midnightntwrk/servicedesk/issues/226) | No subset deploy or multi-insert verifier-key maintenance in midnight-js | midnight-js |

This repo cannot patch `midnight-node` or the public indexer. It can keep the Compact starters honest and decode those failures so Cardano and Midnight builders do not blame their circuit.

## Cardano side

Midnight is the privacy partner chain. Community work that helps both sides is a Compact contract that discloses only a commitment, plus a Preprod call record. Do not bridge ADA from these studios. tNIGHT and tDUST funding stays on the official faucet path: https://docs.midnight.network/guides/acquire-tokens

## Credit

Built by [@kshot9000](https://x.com/kshot9000). Cardano donation address:

`addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`

Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

