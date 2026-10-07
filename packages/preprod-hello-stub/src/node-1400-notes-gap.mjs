/**
 * Classify the missing node 1.0.400 release-notes page.
 * Does not fetch the node, the indexer, or GitHub.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1502
 * Official index (1.0.300 LATEST, read 2026-10-07):
 * https://docs.midnight.network/relnotes/node
 * Published 1.0.300 notes that still call 1.0.400 a planned fix:
 * https://docs.midnight.network/relnotes/node/node-1-0-300
 * Missing page: https://docs.midnight.network/relnotes/node/node-1-0-400
 * Tag named by the issue: https://github.com/midnightntwrk/midnight-node/releases/tag/node-1.0.400
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1502';
export const RELATED = 'https://github.com/midnightntwrk/servicedesk/issues/235';
export const DOCS_NODE = 'https://docs.midnight.network/relnotes/node';
export const DOCS_NODE_1300 = 'https://docs.midnight.network/relnotes/node/node-1-0-300';
export const MISSING_NOTES = 'https://docs.midnight.network/relnotes/node/node-1-0-400';
export const RELEASE_TAG_URL = 'https://github.com/midnightntwrk/midnight-node/releases/tag/node-1.0.400';

/** Versions named on the official node index. Not invented. */
export const DOCUMENTED_LATEST = '1.0.300';
export const PUBLISHED_TAG = '1.0.400';
export const HALT_BLOCK = 1788979;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function version(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return match[0];
}

/**
 * @param {{ documentedLatest?: string, notesPageFor1400?: boolean, releasePublished?: boolean, plansFixIn1400?: boolean }} [input]
 */
export function classifyNode1400NotesGap(input = {}) {
  const documentedLatest = version(input.documentedLatest ?? DOCUMENTED_LATEST);
  const notesPageFor1400 = input.notesPageFor1400 === true;
  const releasePublished = input.releasePublished !== false;
  const plansFixIn1400 = input.plansFixIn1400 !== false;

  if (!documentedLatest) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Node 1.0.400 notes probe incomplete',
      hint: 'Need a dotted documentedLatest from the official node index. This helper does not call the node.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      credit: CREDIT,
    };
  }

  if (
    documentedLatest === '1.0.300' &&
    !notesPageFor1400 &&
    releasePublished &&
    plansFixIn1400
  ) {
    return {
      ok: true,
      classification: 'docs-behind-published-tag',
      documentedLatest,
      publishedTag: PUBLISHED_TAG,
      notesPageFor1400: false,
      haltBlock: HALT_BLOCK,
      title: 'Node 1.0.400 has a tag and no docs page',
      hint: 'Official index still marks 1.0.300 LATEST and still says the genesis-sync halt will be fixed in 1.0.400. Issue #1502 says the tag is published and the notes page is missing. This classification does not fix the public indexer or node.',
      upstream: UPSTREAM,
      related: RELATED,
      docs: DOCS_NODE,
      notes1300: DOCS_NODE_1300,
      missing: MISSING_NOTES,
      release: RELEASE_TAG_URL,
      claim: 'notes-gap classification only — not a node or indexer fix',
      credit: CREDIT,
    };
  }

  if (notesPageFor1400 && documentedLatest === '1.0.400') {
    return {
      ok: true,
      classification: 'aligned',
      documentedLatest,
      notesPageFor1400: true,
      title: 'Documented node notes include 1.0.400',
      hint: 'A notes page exists and the index latest matches the published tag. Still not a node or indexer fix.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unexpected',
    documentedLatest,
    notesPageFor1400,
    releasePublished,
    title: 'Node notes sample does not match the recorded 1.0.300 / 1.0.400 gap',
    hint: 'Pass the versions named on the official node index. Do not invent a 1.0.400 changelog.',
    upstream: UPSTREAM,
    docs: DOCS_NODE,
    credit: CREDIT,
  };
}

export const node1400NotesGapCredit = CREDIT;
