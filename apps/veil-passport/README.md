# Veil Passport Studio

Confidential credentials & selective disclosure for Midnight — **LOCAL-TRUE**.

Issue sealed claims · present public commit · selectively disclose · predicate proofs (age ≥ N, membership ∈ set) · revoke via nullifier.

Real `localStorage` (schema v2) + BroadcastChannel multi-tab sync + JSON export/import.
Honest labels: **LOCAL-TRUE ≠ on-chain**. Not Compact / Lace / proof server.

## Run locally

```bash
cd apps/veil-passport
python3 -m http.server 5184
# open http://localhost:5184
npm test
```

Documented Pages path (when Actions enabled): `/passport/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA / DUST.
- Does **not** claim GitHub Pages is live until workflow scope + Actions are set.
- Commitments, issuer signatures, and predicate π blobs are **teaching stand-ins**.
- Export may include claim fields / salts / holder secrets — treat as sensitive.

## Branding

- X: [@kshot9000](https://x.com/kshot9000)
- ADA: `addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v`
