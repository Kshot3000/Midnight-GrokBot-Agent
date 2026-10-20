/**
 * Classify bulletin-board tutorial URLs that midnight-docs#1577 plans to retire.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1577
 * Tutorials landing: https://docs.midnight.network/tutorials
 * Examples page (still live): https://docs.midnight.network/examples/dapps/bboard
 * Example repo (out of scope): https://github.com/midnightntwrk/example-bboard
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_BBOARD_RETIRE = 'https://github.com/midnightntwrk/midnight-docs/issues/1577';
export const OFFICIAL_TUTORIALS = 'https://docs.midnight.network/tutorials';
export const OFFICIAL_BBOARD_EXAMPLE = 'https://docs.midnight.network/examples/dapps/bboard';
export const EXAMPLE_REPO = 'https://github.com/midnightntwrk/example-bboard';

/** Paths listed for retirement in midnight-docs#1577. Still serving as of 2026-10-20. */
export const RETIRED_PATHS = Object.freeze([
  '/tutorials/bboard',
  '/tutorials/bboard/smart-contract',
  '/tutorials/bboard/bboard-cli',
  '/tutorials/bboard/bboard-api-implementation',
  '/tutorials/bboard/bboard-cli-implementation',
  '/examples/dapps/bboard',
]);

export const REDIRECT_TO = '/tutorials';

/** Contract asserts published on the examples page. Not invented. */
export const BBOARD_ASSERTS = Object.freeze([
  'Attempted to post to an occupied board',
  'Attempted to take down post from an empty board',
  'Attempted to take down post, but not the current owner',
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
 * Classify a docs path or URL against the retirement plan.
 * @param {string} input
 */
export function classifyBboardTutorialPath(input) {
  const path = pathOf(input);
  const retired = RETIRED_PATHS.includes(path);
  if (retired) {
    return {
      ok: false,
      kind: 'planned-retired',
      path,
      redirectTo: REDIRECT_TO,
      stillLive: true,
      hint: `midnight-docs#1577 plans to redirect ${path} to ${REDIRECT_TO}. The page still serves content until that PR lands. Prefer ${OFFICIAL_TUTORIALS} or the example repo for the contract.`,
      upstream: UPSTREAM_BBOARD_RETIRE,
      official: OFFICIAL_TUTORIALS,
      credit: CREDIT,
    };
  }
  if (path === REDIRECT_TO || path === '/tutorials/') {
    return {
      ok: true,
      kind: 'landing',
      path: REDIRECT_TO,
      redirectTo: null,
      stillLive: true,
      hint: 'tutorials landing is the retirement target. Bulletin board tile is still listed there today.',
      upstream: UPSTREAM_BBOARD_RETIRE,
      official: OFFICIAL_TUTORIALS,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    kind: 'other',
    path,
    redirectTo: null,
    stillLive: true,
    hint: 'not one of the six bulletin-board paths listed for retirement in midnight-docs#1577.',
    upstream: UPSTREAM_BBOARD_RETIRE,
    official: OFFICIAL_TUTORIALS,
    credit: CREDIT,
  };
}

/**
 * The example repo and create-mn-app template stay valid. The docs tutorial pages do not.
 * @param {string} ref
 */
export function classifyBboardSource(ref) {
  const raw = String(ref || '').trim();
  if (raw.includes('github.com/midnightntwrk/example-bboard') || raw === 'example-bboard') {
    return {
      ok: true,
      kind: 'example-repo',
      hint: 'midnight-docs#1577 leaves the example-bboard repo in scope. Use it for the Compact contract.',
      upstream: UPSTREAM_BBOARD_RETIRE,
      official: EXAMPLE_REPO,
      credit: CREDIT,
    };
  }
  if (/create-mn-app/.test(raw) && /bboard/.test(raw)) {
    return {
      ok: true,
      kind: 'create-mn-app-template',
      hint: 'midnight-docs#1577 leaves create-mn-app --template bboard in scope. It is still the default template.',
      upstream: UPSTREAM_BBOARD_RETIRE,
      official: EXAMPLE_REPO,
      credit: CREDIT,
    };
  }
  const pathClass = classifyBboardTutorialPath(raw);
  if (pathClass.kind === 'planned-retired') {
    return {
      ok: false,
      kind: 'docs-tutorial',
      hint: pathClass.hint,
      upstream: UPSTREAM_BBOARD_RETIRE,
      official: OFFICIAL_TUTORIALS,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    kind: 'unknown',
    hint: 'not a recognized bulletin-board source. Prefer the example repo or the tutorials landing.',
    upstream: UPSTREAM_BBOARD_RETIRE,
    official: OFFICIAL_TUTORIALS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const retired = classifyBboardTutorialPath('https://docs.midnight.network/tutorials/bboard/smart-contract');
  const landing = classifyBboardTutorialPath('/tutorials');
  const repo = classifyBboardSource('https://github.com/midnightntwrk/example-bboard');
  const ok = !retired.ok && retired.kind === 'planned-retired' && landing.ok && repo.ok;
  if (!ok) {
    console.error(JSON.stringify({ retired, landing, repo }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, path: retired.path, credit: CREDIT }, null, 2));
}
