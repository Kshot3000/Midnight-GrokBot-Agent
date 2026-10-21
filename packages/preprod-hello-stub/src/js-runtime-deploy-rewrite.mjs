/**
 * Classify the two guides that midnight-docs#1579 still wants rewritten off the bulletin board.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1579
 * Official: https://docs.midnight.network/guides/compact-javascript-runtime
 *          https://docs.midnight.network/guides/deploy-and-operate
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_REWRITE = 'https://github.com/midnightntwrk/midnight-docs/issues/1579';
export const OFFICIAL_JS_RUNTIME = 'https://docs.midnight.network/guides/compact-javascript-runtime';
export const OFFICIAL_DEPLOY = 'https://docs.midnight.network/guides/deploy-and-operate';
export const EXAMPLE_REPO = 'https://github.com/midnightntwrk/example-bboard';

/** Paths that still use the bulletin board as the worked example. */
export const STILL_BBOARD_PATHS = Object.freeze([
  '/guides/compact-javascript-runtime',
  '/guides/deploy-and-operate',
]);

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function pathOf(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return new URL(raw).pathname.replace(/\/$/, '') || '/';
    }
  } catch {
    /* fall through */
  }
  const cleaned = raw.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
}

/**
 * Classify a docs path or URL against the still-bboard guides.
 * @param {string} input
 */
export function classifyJsRuntimeDeployPath(input) {
  const path = pathOf(input);
  if (STILL_BBOARD_PATHS.includes(path)) {
    return {
      ok: false,
      kind: 'still-bboard',
      path,
      hint: `midnight-docs#1579: ${path} still uses the bulletin board contract end to end. Prefer a maintained example until the rewrite lands. Official page remains the source of truth for the pattern.`,
      upstream: UPSTREAM_REWRITE,
      official: path.includes('deploy') ? OFFICIAL_DEPLOY : OFFICIAL_JS_RUNTIME,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    kind: 'other',
    path,
    hint: 'not one of the two guides listed in midnight-docs#1579 for rewrite off bboard.',
    upstream: UPSTREAM_REWRITE,
    official: OFFICIAL_JS_RUNTIME,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const js = classifyJsRuntimeDeployPath(OFFICIAL_JS_RUNTIME);
  const deploy = classifyJsRuntimeDeployPath(OFFICIAL_DEPLOY);
  const other = classifyJsRuntimeDeployPath('/guides/networks-and-environments');
  const ok = !js.ok && js.kind === 'still-bboard' && !deploy.ok && other.ok;
  if (!ok) {
    console.error(JSON.stringify({ js, deploy, other }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, js: js.path, deploy: deploy.path, credit: CREDIT }, null, 2));
}
