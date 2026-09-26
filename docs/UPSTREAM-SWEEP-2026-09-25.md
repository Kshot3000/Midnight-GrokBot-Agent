# Upstream Midnight GitHub sweep — 2026-09-25

Work done from this lab (Kshot3000) against Midnight ecosystem repos.

## PRs opened
- https://github.com/midnightntwrk/midnight-docs/pull/1406 — enumerate `window.midnight` in Next.js guide + Lace blog (stop hardcoding `mnLace`)
- https://github.com/midnightntwrk/example-zkloan/pull/60 — UI: enumerate wallets instead of preferring `mnLace`
- https://github.com/midnightntwrk/midnight-sdk/pull/416 — README: prefer `example-bboard` / `create-mn-app` over archived `example-counter`
- https://github.com/midnightntwrk/midnight-awesome-dapps/pull/194 — already open (counter archived pointer; do not duplicate)

## Security issues filed (MPS-0029)
- https://github.com/OpenZeppelin/midnight-apps/issues/322 — `AccessControl` uses `ownPublicKey()` for authorization
- https://github.com/MeshJS/midnight-contracts/issues/10 — `board.compact` stores/asserts `posterPk` from `ownPublicKey()`

MPS text: https://github.com/midnightntwrk/midnight-improvement-proposals/blob/main/mps/mps-0029-compact-caller-identity.md

## Local lab posture
- Lace kit already enumerates UUID keys (not hardcoded `mnLace`)
- Agent escrow + hello.compact document MPS-0029 / prefer example-bboard
- NightDream.io: live ADA spot (Coinbase) + Cardano tip (Koios) overlays on DEMO desk
