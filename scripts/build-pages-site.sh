#!/usr/bin/env bash
# Assemble the static GitHub Pages site into site/ (hub at root, studios nested).
#
# Publishes ONLY browser runtime files per studio (index.html, main.js,
# styles.css, *-core.mjs, persist.mjs, prove-metrics.mjs) plus the Lace Vite
# dist under /lace/. Dev files (tests, vitest config, package manifests,
# node_modules, the Node-only prove-bridge server) are intentionally excluded.
#
# Usage: PAGES_BASE=/Midnight-GrokBot-Agent/lace/ npm run build:lace-demo first,
# then: bash scripts/build-pages-site.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SITE=site
rm -rf "$SITE"
mkdir -p "$SITE"

copy_studio() {
  local src="$1" dest="$2"
  mkdir -p "$SITE/$dest"
  local f base
  for f in "$src"/*; do
    base="$(basename "$f")"
    case "$base" in
      index.html|main.js|styles.css|*-core.mjs|persist.mjs|prove-metrics.mjs)
        cp "$f" "$SITE/$dest/" ;;
    esac
  done
  if [ ! -f "$SITE/$dest/index.html" ]; then
    echo "ERROR: $src produced no index.html for /$dest/" >&2
    exit 1
  fi
}

# Hub at Pages root
cp apps/midnight-lab-site/index.html apps/midnight-lab-site/main.js apps/midnight-lab-site/styles.css "$SITE/"
mkdir -p "$SITE/assets"
cp apps/midnight-lab-site/assets/* "$SITE/assets/" 2>/dev/null || true

copy_studio apps/agent-escrow-stub   escrow
copy_studio apps/hello-studio       hello
copy_studio apps/auth-lab            auth
copy_studio apps/shield-board       board
copy_studio apps/veil-pledge        pledge
copy_studio apps/night-market       market
copy_studio apps/sealed-invite      invite
copy_studio apps/proof-playground   proof
copy_studio apps/private-ballot     ballot
copy_studio apps/veil-passport      passport
copy_studio apps/compact-atelier    atelier
copy_studio apps/nocturne-messenger nocturne

# Lace Vite build under /lace/
if [ ! -f apps/lace-connect-demo/dist/index.html ]; then
  echo "ERROR: apps/lace-connect-demo/dist missing — run: PAGES_BASE=/Midnight-GrokBot-Agent/lace/ npm run build:lace-demo" >&2
  exit 1
fi
mkdir -p "$SITE/lace"
cp -R apps/lace-connect-demo/dist/. "$SITE/lace/"

# Serve files verbatim (no Jekyll processing)
touch "$SITE/.nojekyll"
printf 'Midnight GrokBot Agent Pages build\ncommit: %s\nbuilt: %s\n' \
  "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)" \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$SITE/.pages-build"

echo "Assembled $SITE/:"
find "$SITE" -type f | sort
du -sh "$SITE"
