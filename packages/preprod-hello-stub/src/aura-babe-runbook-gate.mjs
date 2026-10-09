/**
 * Gate lab notes so an unpublished Aura→BABE runbook is not treated as public docs.
 * Does not fetch a node, an indexer, or GitHub.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1092
 * Official consensus page (still AURA / GRANDPA):
 * https://docs.midnight.network/concepts/network-architecture/consensus
 * Official nodes page: https://docs.midnight.network/nodes
 * Support matrix (node 1.0.400, no BABE row):
 * https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1092';
export const DOCS_CONSENSUS = 'https://docs.midnight.network/concepts/network-architecture/consensus';
export const DOCS_NODES = 'https://docs.midnight.network/nodes';
export const DOCS_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const NODE_RUNBOOK =
  'https://github.com/midnightntwrk/midnight-node/blob/e1efdccc1c2f065772620f51dfec26d2aaf54dab/docs/aura-to-babe-migration-runbook.md';

export const PINS = {
  compact: '0.31.1',
  language: '0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
};

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function text(value) {
  return typeof value === 'string' ? value : '';
}

/**
 * @param {string} officialExcerpt
 */
export function officialStillAura(officialExcerpt) {
  const body = text(officialExcerpt);
  return /AURA/i.test(body) && /GRANDPA/i.test(body) && !/BABE session keys/i.test(body);
}

/**
 * @param {string} note
 * @param {{ issueOpen?: boolean, publicDocsBlocked?: boolean, officialExcerpt?: string }} [ctx]
 */
export function classifyRunbookNote(note, ctx = {}) {
  const body = text(note);
  const issueOpen = ctx.issueOpen !== false;
  const publicDocsBlocked = ctx.publicDocsBlocked !== false;
  const stillAura = officialStillAura(
    ctx.officialExcerpt ?? 'AURA for block production and GRANDPA for finality.',
  );
  const treatsRunbookAsPublic =
    /docs\.midnight\.network/i.test(body) && /babe/i.test(body) && /current|published|follow the runbook/i.test(body);
  const mintsBabeNow = /mint BABE|generate BABE session keys|drop AURA keys/i.test(body);
  const citesBlockedIssue = /1092/.test(body) && /blocked|not published|not public/i.test(body);

  if (!stillAura || !issueOpen || !publicDocsBlocked) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Aura→BABE public-docs gate needs the published AURA pages',
      hint: 'Pass an official excerpt that still names AURA and GRANDPA. This helper does not call a node.',
      upstream: UPSTREAM,
      docs: DOCS_CONSENSUS,
      doesNotFixPublicNode: true,
      credit: CREDIT,
    };
  }

  if (treatsRunbookAsPublic || mintsBabeNow) {
    return {
      ok: false,
      classification: 'runbook-not-public-docs',
      title: 'Node-repo Aura→BABE runbook is not a docs.midnight.network page',
      hint: 'Issue #1092 is still blocked. The runbook cited on 2026-10-09 lives in midnight-node, not on the public docs site. Do not mint BABE keys from a Compact prove path.',
      upstream: UPSTREAM,
      docs: [DOCS_CONSENSUS, DOCS_NODES, DOCS_MATRIX],
      nodeRunbook: NODE_RUNBOOK,
      pins: PINS,
      doesNotFixPublicNode: true,
      credit: CREDIT,
    };
  }

  if (citesBlockedIssue) {
    return {
      ok: true,
      classification: 'stays-on-published-aura',
      title: 'Note keeps builders on published AURA docs',
      hint: 'Public docs still say AURA / GRANDPA. Issue #1092 remains the docs tracker. This is not a node or indexer fix.',
      upstream: UPSTREAM,
      docs: DOCS_CONSENSUS,
      nodeRunbook: NODE_RUNBOOK,
      pins: PINS,
      doesNotFixPublicNode: true,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'missing-citation',
    title: 'Note does not cite the blocked public-docs issue',
    hint: 'Cite midnight-docs#1092 and say the public pages are not updated.',
    upstream: UPSTREAM,
    docs: DOCS_CONSENSUS,
    doesNotFixPublicNode: true,
    credit: CREDIT,
  };
}

export const auraBabeRunbookGateCredit = CREDIT;
