/**
 * Classify a Quickstart-page snippet for the create-mn-app vs new-scaffolder gap.
 * Does not fetch docs, does not call npm, does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587
 * Official: https://docs.midnight.network/getting-started/quickstart
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1587';
export const OFFICIAL = 'https://docs.midnight.network/getting-started/quickstart';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** @param {string} snippet */
export function classifyQuickstartSnippet(snippet) {
  const text = String(snippet ?? '');
  const hasCreateMnApp = /create-mn-app/i.test(text);
  const hasNewScaffolder = /midnight-examples/i.test(text) && !hasCreateMnApp;
  return {
    hasCreateMnApp,
    hasNewScaffolder,
    kind: hasCreateMnApp ? 'create-mn-app' : hasNewScaffolder ? 'new-scaffolder' : 'unknown',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'npx create-mn-app my-app --template bboard';
  const result = classifyQuickstartSnippet(sample);
  console.log(JSON.stringify({ ok: result.kind === 'create-mn-app', ...result }, null, 2));
  if (result.kind !== 'create-mn-app') process.exit(1);
}
