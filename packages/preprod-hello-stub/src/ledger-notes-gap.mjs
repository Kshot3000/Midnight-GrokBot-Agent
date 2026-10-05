/**
 * Classify the Ledger 8.1.3 release-notes gap without bumping lab pins.
 * Does not fetch the ledger repo, the indexer, or the node.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1453
 * Official index (still lists 8.1.2 as LATEST as of 2026-10-05):
 * https://docs.midnight.network/relnotes/ledger
 * Release tag cited by that issue (no notes body copied here):
 * https://github.com/midnightntwrk/midnight-ledger/releases/tag/ledger-8.1.3
 * Lab proof-server pin stays 8.1.0:
 * https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1453';
export const DOCS_LEDGER = 'https://docs.midnight.network/relnotes/ledger';
export const DOCS_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const RELEASE_TAG_URL = 'https://github.com/midnightntwrk/midnight-ledger/releases/tag/ledger-8.1.3';

/** Versions observed on the official ledger index, not invented. */
export const DOCUMENTED_LEDGER_VERSIONS = Object.freeze(['8.1.2', '8.1.1', '8.1.0', '8.0.3', '8.0.2', '7.0.0']);
export const DOCUMENTED_LATEST = '8.1.2';
export const UNDOCUMENTED_TAG = '8.1.3';
export const LAB_PROOF_SERVER = '8.1.0';

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

function compare(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/**
 * @param {{ documentedLatest?: string, releaseTag?: string, labProofServer?: string, documentedVersions?: string[] }} [input]
 */
export function classifyLedgerNotesGap(input = {}) {
  const documentedLatest = version(input.documentedLatest ?? DOCUMENTED_LATEST);
  const releaseTag = version(input.releaseTag ?? UNDOCUMENTED_TAG);
  const labProofServer = version(input.labProofServer ?? LAB_PROOF_SERVER);
  const documentedVersions = (input.documentedVersions ?? DOCUMENTED_LEDGER_VERSIONS).map(version).filter(Boolean);

  if (!documentedLatest || !releaseTag || !labProofServer) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Ledger notes probe incomplete',
      hint: 'Need dotted versions for documentedLatest, releaseTag, and labProofServer. This helper does not call GitHub or the node.',
      upstream: UPSTREAM,
      docs: DOCS_LEDGER,
    };
  }

  const tagInDocs = documentedVersions.includes(releaseTag) || documentedLatest === releaseTag;
  const tagAhead = compare(releaseTag, documentedLatest) > 0;
  const labMatchesPin = labProofServer === LAB_PROOF_SERVER;
  const labTracksUndocumentedTag = labProofServer === releaseTag && !tagInDocs;

  let classification = 'aligned';
  let title = 'Documented ledger latest covers the cited tag';
  let hint = 'The cited release tag is already on the official ledger index. Still do not treat this lab note as a node or indexer fix.';

  if (labTracksUndocumentedTag) {
    classification = 'lab-pin-follows-undocumented-tag';
    title = 'Lab proof-server pin follows a tag with no docs page';
    hint = `proof-server ${labProofServer} matches release tag ${releaseTag}, which is not on ${DOCS_LEDGER} (documented latest ${documentedLatest}). Keep the lab pin at ${LAB_PROOF_SERVER} until midnight-docs#1453 has a notes page. Not a public indexer or node fix.`;
  } else if (tagAhead && !tagInDocs) {
    classification = 'docs-behind-release-tag';
    title = 'Ledger release tag has no docs page';
    hint = `midnight-docs#1453 cites ledger-${releaseTag}, published without a page under ${DOCS_LEDGER}. The index still marks ${documentedLatest} LATEST. Lab proof-server stays ${LAB_PROOF_SERVER} (support matrix). Do not copy a changelog that the release page did not publish. Not a public indexer or node fix.`;
  } else if (!labMatchesPin) {
    classification = 'lab-pin-drift';
    title = 'Lab proof-server pin drifted from 8.1.0';
    hint = `Expected lab proof-server ${LAB_PROOF_SERVER} from the support matrix and this repo pin. Got ${labProofServer}.`;
  }

  return {
    ok: classification === 'aligned' || classification === 'docs-behind-release-tag',
    classification,
    documentedLatest,
    releaseTag,
    labProofServer,
    tagInDocs,
    title,
    hint,
    upstream: UPSTREAM,
    docs: DOCS_LEDGER,
    matrix: DOCS_MATRIX,
    release: RELEASE_TAG_URL,
    claim: 'notes-gap classification only — not a ledger, indexer, or node fix',
  };
}

export const ledgerNotesGapCredit = CREDIT;
