/**
 * Classify the JavaScript runtime and deploy guides that still sample bulletin board.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1579
 * Official:
 *   https://docs.midnight.network/guides/compact-javascript-runtime
 *   https://docs.midnight.network/guides/deploy-and-operate
 * Replacement shape: https://docs.midnight.network/getting-started/hello-world
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_JS_RUNTIME_DEPLOY = 'https://github.com/midnightntwrk/midnight-docs/issues/1579';
export const OFFICIAL_JS_RUNTIME = 'https://docs.midnight.network/guides/compact-javascript-runtime';
export const OFFICIAL_DEPLOY = 'https://docs.midnight.network/guides/deploy-and-operate';
export const OFFICIAL_HELLO = 'https://docs.midnight.network/getting-started/hello-world';
export const EXAMPLE_REPO = 'https://github.com/midnightntwrk/example-bboard';

/** Paths the issue says still use the bulletin board contract as the worked example. */
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
 * Classify a docs path or URL against midnight-docs#1579.
 * @param {string} input
 */
export function classifyJsRuntimeDeployPath(input) {
  const path = pathOf(input);
  const stillBboard = STILL_BBOARD_PATHS.includes(path);
  if (stillBboard) {
    return {
      ok: false,
      kind: 'still-using-bboard',
      path,
      hint: `midnight-docs#1579: ${path} still uses the bulletin board contract as its worked example. example-bboard is planned for archival. Prefer the hello-world contract on ${OFFICIAL_HELLO} (pragma language_version 0.23; disclose for public writes).`,
      upstream: UPSTREAM_JS_RUNTIME_DEPLOY,
      official: OFFICIAL_HELLO,
      credit: CREDIT,
    };
  }
  if (path === '/getting-started/hello-world' || path.endsWith('/getting-started/hello-world')) {
    return {
      ok: true,
      kind: 'hello-replacement',
      path,
      hint: 'hello-world getting-started page shows the pin-matching contract with pragma language_version 0.23 and disclose().',
      upstream: UPSTREAM_JS_RUNTIME_DEPLOY,
      official: OFFICIAL_HELLO,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    kind: 'other',
    path,
    hint: 'not one of the two guides listed in midnight-docs#1579 as still using bulletin board.',
    upstream: UPSTREAM_JS_RUNTIME_DEPLOY,
    official: OFFICIAL_HELLO,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const js = classifyJsRuntimeDeployPath(OFFICIAL_JS_RUNTIME);
  const deploy = classifyJsRuntimeDeployPath(OFFICIAL_DEPLOY);
  const hello = classifyJsRuntimeDeployPath(OFFICIAL_HELLO);
  const ok = !js.ok && js.kind === 'still-using-bboard' && !deploy.ok && hello.ok;
  if (!ok) {
    console.error(JSON.stringify({ js, deploy, hello }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, paths: STILL_BBOARD_PATHS, credit: CREDIT }, null, 2));
}
