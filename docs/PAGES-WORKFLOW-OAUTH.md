# GitHub Pages workflow — OAuth / PAT scope (honest)

**Status:** Pages URL may still **404**. This doc does **not** claim Pages is live.
Workflow file is staged at [`pages.workflow.yml`](./pages.workflow.yml); it is **not**
under `.github/workflows/` until a token with the `workflow` scope pushes it.

Documented (future) URL: https://kshot3000.github.io/Midnight-GrokBot-Agent/

## Why CI cannot push the workflow yet

GitHub blocks creating or updating files under `.github/workflows/` unless the
credential has the **`workflow`** scope (classic PAT) or the equivalent fine-grained
permission for Actions workflows. The lab OAuth app token used for ordinary
`contents` pushes lacks that scope — so Agents can update apps/docs but cannot
land `pages.yml` via the same token.

## One-time enablement (human / PAT)

1. Create a classic PAT with scopes: `repo` + **`workflow`**  
   (or a fine-grained token with Contents read/write **and** Workflows read/write
   on `Kshot3000/Midnight-GrokBot-Agent`).
2. Clone / pull `main`, then:

   ```bash
   mkdir -p .github/workflows
   cp docs/pages.workflow.yml .github/workflows/pages.yml
   git add .github/workflows/pages.yml
   git commit -m "ci: enable GitHub Pages workflow"
   git push origin main   # use the workflow-scoped PAT for this push
   ```

3. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Confirm the Actions run for `Deploy GitHub Pages` succeeds.
5. Revoke or rotate the PAT if it was created only for this step.

## What the workflow builds

See [`pages.workflow.yml`](./pages.workflow.yml): `npm ci`, Lace Vite build with
`PAGES_BASE`, assemble static `site/` (hub + studios + `/lace/` dist), upload
Pages artifact, deploy. No Compact compile or proof-server in CI yet.

## Do not claim

- Do not advertise the Pages URL as live until Settings → Pages shows a
  successful deployment.
- Do not commit secrets or PATs into this repo.
