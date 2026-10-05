/**
 * Classify the node 1.0.300 genesis-sync halt signature from a log line.
 * Does not call a node, indexer, or RPC. Does not claim a public fix.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/235
 * Node index (lists 1.0.2 SUPPORTED; says runtime 1.0.300 needs node 1.0.300):
 * https://docs.midnight.network/relnotes/node
 * Support matrix node pin: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/235';
export const DOCS_NODE = 'https://docs.midnight.network/relnotes/node';
export const DOCS_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

/** Halt reported on node-1.0.300; import stops before this next block. */
export const HALT_HEIGHT = 1788979;
export const NEXT_BLOCK = 1788980;
export const AFFECTED_NODE = '1.0.300';
export const UNPUBLISHED_FIX_NODE = '1.0.400';
export const MATRIX_NODE = '1.0.300';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const TTL_RE = /Intent TTL has expired/i;
const CUSTOM_182_RE = /Invalid\(Custom\(182\)\)/;
const HEIGHT_RE = /#?\b(1788979|1788980)\b/;

function textOf(input) {
  if (typeof input === 'string') return input;
  if (input && typeof input.log === 'string') return input.log;
  return '';
}

/**
 * @param {{ log?: string, nodeVersion?: string, audience?: string, publishedFix?: boolean } | string} [input]
 */
export function classifyGenesisSyncHalt(input = {}) {
  const source = typeof input === 'string' ? { log: input } : input;
  const log = textOf(source);
  const nodeVersion = typeof source.nodeVersion === 'string' ? source.nodeVersion : AFFECTED_NODE;
  const audience = source.audience === 'public' ? 'public' : 'self-hosted';
  const publishedFix = source.publishedFix === true;

  if (!log.trim()) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Genesis-sync probe incomplete',
      hint: 'Pass the node log line. This helper does not dial a node or indexer.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
    };
  }

  const ttl = TTL_RE.test(log);
  const custom182 = CUSTOM_182_RE.test(log);
  const heightHit = HEIGHT_RE.test(log);
  const affectedVersion = nodeVersion === AFFECTED_NODE;

  if (audience === 'public') {
    return {
      ok: true,
      classification: 'public-endpoints-unaffected',
      title: 'Public RPC and indexer callers are not on this halt path',
      hint: 'servicedesk#235 says DApps on the public RPC, indexer, and proof server are unaffected. Chain semantics are unchanged. This lab does not fix the public indexer or node.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      matrix: DOCS_MATRIX,
      claim: 'classification only — not a node or indexer fix',
    };
  }

  if (ttl && (custom182 || heightHit) && affectedVersion && !publishedFix) {
    return {
      ok: true,
      classification: 'genesis-sync-halt',
      title: `node ${AFFECTED_NODE} genesis sync matches the #${HALT_HEIGHT} halt`,
      hint: `Log matches Intent TTL expired (Custom 182) on node ${AFFECTED_NODE}, the signature in servicedesk#235 / midnight-node#2229. Import stops at #${HALT_HEIGHT}; block #${NEXT_BLOCK} is the rejected block. Draft notes say node ${UNPUBLISHED_FIX_NODE} resumes a halted node with no resync, but that release is not published. Support matrix still lists node ${MATRIX_NODE}. This is not a node or indexer fix. Public endpoints are unaffected.`,
      haltHeight: HALT_HEIGHT,
      nextBlock: NEXT_BLOCK,
      nodeVersion,
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      matrix: DOCS_MATRIX,
      claim: 'classification only — not a node or indexer fix',
    };
  }

  if (ttl && nodeVersion === UNPUBLISHED_FIX_NODE && publishedFix) {
    return {
      ok: true,
      classification: 'fix-release-published',
      title: `node ${UNPUBLISHED_FIX_NODE} marked published by the caller`,
      hint: 'Caller asserted the fix release is published. Confirm the tag yourself. This helper does not query GitHub releases and does not apply the node fix.',
      upstream: UPSTREAM,
      docs: DOCS_NODE,
      claim: 'classification only — not a node or indexer fix',
    };
  }

  return {
    ok: false,
    classification: 'unrelated',
    title: 'Log is not the genesis-sync halt signature',
    hint: 'Need Intent TTL expired plus Custom(182) or height 1788979/1788980 on node 1.0.300. Other submission errors stay on their own decoders.',
    upstream: UPSTREAM,
    docs: DOCS_NODE,
    claim: 'classification only — not a node or indexer fix',
  };
}

export const genesisSyncHaltCredit = CREDIT;
