/**
 * Classify the current create-mn-app quickstart vs the planned midnight-examples scaffolder.
 * Does not run npx, does not invent a new CLI, does not call a proof server or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587
 * Official quickstart (still create-mn-app): https://docs.midnight.network/getting-started/quickstart
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_QUICKSTART =
  'https://github.com/midnightntwrk/midnight-docs/issues/1587';
export const OFFICIAL_QUICKSTART =
  'https://docs.midnight.network/getting-started/quickstart';
export const BLOCKED_ON =
  'https://github.com/midnightntwrk/midnight-examples/issues/59';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Commands and phrases still on the published quickstart page. */
export const LEGACY_QUICKSTART = Object.freeze({
  npx: 'npx create-mn-app',
  setup: 'npm run setup -- --network',
  templates: ['hello-world', 'battleship', 'bboard', 'leaderboard'],
});

/**
 * Flag a command or snippet that still uses the create-mn-app path.
 * @param {string} text
 */
export function classifyQuickstartCommand(text) {
  const raw = String(text || '').trim();
  if (!raw) {
    return {
      ok: false,
      kind: 'empty',
      hint: 'no command. Official quickstart still documents npx create-mn-app.',
      upstream: UPSTREAM_QUICKSTART,
      official: OFFICIAL_QUICKSTART,
      credit: CREDIT,
    };
  }
  if (raw.includes('create-mn-app')) {
    return {
      ok: false,
      kind: 'legacy-create-mn-app',
      hint: 'midnight-docs#1587: this is the create-mn-app 0.5.x path. A new scaffolder from midnight-examples is planned but blocked on midnight-examples#59. Do not invent the new CLI.',
      upstream: UPSTREAM_QUICKSTART,
      official: OFFICIAL_QUICKSTART,
      blockedOn: BLOCKED_ON,
      credit: CREDIT,
    };
  }
  if (raw.includes('midnight-examples') || raw.includes('npx @midnight')) {
    return {
      ok: false,
      kind: 'unverified-new-scaffolder',
      hint: 'midnight-docs#1587 is blocked until the new tool is published. Do not document an unpublished npx command.',
      upstream: UPSTREAM_QUICKSTART,
      official: OFFICIAL_QUICKSTART,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    kind: 'other',
    hint: 'not a quickstart scaffold command.',
    upstream: UPSTREAM_QUICKSTART,
    official: OFFICIAL_QUICKSTART,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const legacy = classifyQuickstartCommand('npx create-mn-app my-app --template hello-world');
  const ok = !legacy.ok && legacy.kind === 'legacy-create-mn-app';
  if (!ok) {
    console.error(JSON.stringify(legacy, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kind: legacy.kind, credit: CREDIT }, null, 2));
}
