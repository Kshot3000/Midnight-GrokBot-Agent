/**
 * Classify a pasted create-mn-app / scaffolder command against midnight-docs#1587.
 * Does not run npm, Compact, or any network call.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1587
 * Official: https://docs.midnight.network/getting-started/quickstart
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1587';
export const QUICKSTART = 'https://docs.midnight.network/getting-started/quickstart';
export const BLOCKER = 'https://github.com/midnightntwrk/midnight-examples/issues/59';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} input
 */
export function classifyQuickstartCommand(input) {
  const text = String(input || '').trim();
  const hasCreateMn = /create-mn-app/.test(text);
  const hasExamples = /midnight-examples|create-mn-examples|npx\s+@midnight/.test(text);

  if (!text) {
    return {
      ok: false,
      classification: 'empty',
      title: 'no command',
      hint: 'Paste an npx create-mn-app line. This helper does not run it.',
      upstream: UPSTREAM,
      docs: QUICKSTART,
      credit: CREDIT,
    };
  }

  if (hasCreateMn && !hasExamples) {
    return {
      ok: true,
      classification: 'documented-create-mn-app',
      title: 'Matches current published Quickstart',
      hint: 'midnight-docs#1587: the page still documents create-mn-app. The new midnight-examples scaffolder is planned but blocked on midnight-examples#59. Do not invent a CLI. This classification does not run the command and does not fix the public docs site, indexer, or node.',
      upstream: UPSTREAM,
      docs: QUICKSTART,
      blocker: BLOCKER,
      claim: 'sample classification only',
      credit: CREDIT,
    };
  }

  if (hasExamples) {
    return {
      ok: true,
      classification: 'planned-scaffolder',
      title: 'Looks like the planned midnight-examples scaffolder',
      hint: 'The rewrite of the Quickstart is blocked until the tool is published. Prefer the official page until then. This helper does not execute the command.',
      upstream: UPSTREAM,
      docs: QUICKSTART,
      blocker: BLOCKER,
      claim: 'sample classification only — not a docs or node fix',
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    classification: 'other',
    title: 'Not recognized as the documented or planned scaffolder',
    hint: 'Official Quickstart currently uses create-mn-app. See midnight-docs#1587.',
    upstream: UPSTREAM,
    docs: QUICKSTART,
    credit: CREDIT,
  };
}

export const quickstartScaffolderCredit = CREDIT;
