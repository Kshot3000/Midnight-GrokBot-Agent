# studio-craft

Shared design tokens + donate dock / branding footer for Midnight Studio Hub apps.

## Why copy, not import?

GitHub Pages (and `python3 -m http.server` per-app) serve each studio from its own path
(`…/board/`, `…/pledge/`, …). A `<link href="../../packages/studio-craft/tokens.css">`
would 404. Keep this package as the **canonical source**; sync `:root` and dock CSS into
each app’s `styles.css` when tokens change.

## Contents

| File | Role |
| --- | --- |
| `tokens.css` | Canonical `:root` craft tokens (incl. `--danger` / `--bad` / `--fail` aliases) |
| `donate-dock.css` | Floating donate dock + branding footer helpers |
| `donate-dock.snippet.html` | Markup for the always-visible dock |

## Branding

- ADA: see root [`BRANDING.md`](../../BRANDING.md)
- X: [@kshot9000](https://x.com/kshot9000)

Every studio must keep **Donate ADA** + **@kshot9000** visible (dock and/or footer) and
label itself **LOCAL STUB** where it is not on-chain.
