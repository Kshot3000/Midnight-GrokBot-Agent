# Veil Passport Studio

Confidential credentials & selective disclosure for Midnight — educational **local stub**.

Issue sealed claims · present public commit · selectively disclose · predicate proofs (age ≥ N, membership ∈ set) · revoke via nullifier.
Starfield + aurora, keyboard shortcuts, donate dock (`@kshot9000` + Cardano addr), honest **LOCAL STUB · not on-chain** labels.

## Run locally

```bash
cd apps/veil-passport
python3 -m http.server 5184
# open http://localhost:5184
```

Documented Pages path (when Actions enabled): `/passport/`.

## Honest scope

- Does **not** run Compact, a proof server, Lace, or real ADA / DUST.
- Does **not** claim GitHub Pages is live until workflow scope + Actions are set.
- Commitments, issuer signatures, and predicate π blobs are **teaching stand-ins** — verify official Compact / Zswap crypto before shipping.

## Flow

| Step | Teaching point |
|------|----------------|
| Issue | Private claims → credential commit + issuer sig (sim) |
| Present | Public surface: commit + stamp only |
| Selective disclose | Open chosen claims; rest stay veiled |
| Over-disclose | Warn path — privacy rail collapses |
| Predicate | Prove age ≥ N or membership ∈ set without raw claim |
| Tamper | Mutate π → fail path |
| Revoke | Burn nullifier → presentations fail |

Built by [@kshot9000](https://x.com/kshot9000).
