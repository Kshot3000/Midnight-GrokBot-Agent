/**
 * Classify the missing node 1.0.300 release-notes page.
 * Does not fetch the node, the indexer, or GitHub.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1390
 * Official index (1.0.2 SUPPORTED, no 1.0.300 page, read 2026-10-05):
 * https://docs.midnight.network/relnotes/node
 * Published 1.0.2 notes that point operators at 1.0.300:
 * https://docs.midnight.network/relnotes/node/node-1-0-2
 * Missing page: https://docs.midnight.network/relnotes/node/node-1-0-300
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1390';
export const DOCS_NODE = 'https://docs.midnight.network/relnotes/node';
export const DOCS_NODE_102 = 'https://docs.midnight.network/relnotes/node/node-1-0-2';
export const MISSING_NOTES = 'https://docs.midnight.network/relnotes/node/node-1-0-300';
export const RELEASE_TAG_URL = 'https://github.com/midnightntwrk/midnight-node/releases/tag/node-1.0.300';

/** Versions named on the official node index / 1.0.2 notes. Not invented. */
export const DOCUMENTED_NOTES_VERSION = '1.0.2';
export const PUBLIC_RUNTIME_CITED = '1.0.300';
export const TOOLKIT_FAILURE = 'UnsupportedBlockVersion(1000300)';

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
 * @param {{ documentedNotes?: string, publicRuntime?: string, notesPageExists?: boolean }} [input]
 */
export function classifyNodeNotesGap(input = {}) {
  const documentedNotes = version(input.documentedNotes ?? DOCUMENTED_NOTES_VERSION);
  const publicRuntime = version(input.publicRuntime ?? PUBLIC_RUNTIME_CITED);
  const notesPageExists = input.notesPageExists === true;

  if (!documentedNotes || !publicRuntime) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Node notes probe incomplete',
      hint: 'Need dotted versions for documentedNotes and publicRuntime. This helper does not call the node.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      credit: CREDIT,
    };
  }

  if (publicRuntime === '1.0.300' && documentedNotes === '1.0.2' && !notesPageExists) {
    return {
      ok: true,
      classification: 'docs-behind-public-runtime',
      documentedNotes,
      publicRuntime,
      notesPageExists: false,
      toolkitFailure: TOOLKIT_FAILURE,
      title: 'Node 1.0.300 has a tag link and no docs page',
      hint: 'Official 1.0.2 notes say Preview, Preprod, and Mainnet run runtime 1.0.300 and that node 1.0.2 cannot import those blocks. The 1.0.300 notes URL 404s. This classification does not fix the public indexer or node.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      notes102: DOCS_NODE_102,
      missing: MISSING_NOTES,
      release: RELEASE_TAG_URL,
      claim: 'notes-gap classification only — not a node or indexer fix',
      credit: CREDIT,
    };
  }

  if (notesPageExists && publicRuntime === documentedNotes) {
    return {
      ok: true,
      classification: 'aligned',
      documentedNotes,
      publicRuntime,
      notesPageExists: true,
      title: 'Documented node notes match the cited public runtime',
      hint: 'A notes page exists for the cited public runtime. Still not a node or indexer fix.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unexpected',
    documentedNotes,
    publicRuntime,
    notesPageExists,
    title: 'Node notes sample does not match the recorded 1.0.2 / 1.0.300 gap',
    hint: 'Pass the versions named on the official node index. Do not invent a 1.0.300 changelog.',
    upstream: UPSTREAM,
    docs: DOCS_NODE,
    credit: CREDIT,
  };
}

export const nodeNotesGapCredit = CREDIT;
