/**
 * Note for the runbook fact-check failure on the migration section anchor.
 * Does not call a node, indexer, or proof server. Does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/270
 * Official: https://docs.midnight.network/guides/networks-and-environments
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/270';
export const OFFICIAL =
  'https://docs.midnight.network/guides/networks-and-environments';
export const EXPECTED_ANCHOR = 'migrating-from-the-midnight-hosted-mainnet-endpoints';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify whether a heading or source fragment still names the migration section.
 * @param {string} fragment
 */
export function classifyMigrationAnchor(fragment) {
  const text = String(fragment || '');
  const hasOldId = text.includes(EXPECTED_ANCHOR);
  const hasHeading =
    /Migrating from the Midnight-hosted endpoints/i.test(text) ||
    /migrating-from-the-midnight-hosted/i.test(text);

  if (hasOldId || hasHeading) {
    return {
      ok: true,
      classification: 'section-still-present',
      title: 'migration section still documented',
      hint: 'servicedesk#270 reports the explicit source identifier is missing from the MDX, but the published Networks and environments page still renders the section under the same anchor. Use the official page for the Blockfrost replacement table. This does not fix the public runbook or docs site.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    title: 'not the migration section',
    hint: 'Expected the anchor migrating-from-the-midnight-hosted-mainnet-endpoints or the heading Migrating from the Midnight-hosted endpoints.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const live = classifyMigrationAnchor(
    '## Migrating from the Midnight-hosted endpoints\n(#migrating-from-the-midnight-hosted-mainnet-endpoints)',
  );
  const missing = classifyMigrationAnchor('unrelated heading');
  const ok = live.ok && live.classification === 'section-still-present' && !missing.ok;
  if (!ok) {
    console.error(JSON.stringify({ live, missing }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
