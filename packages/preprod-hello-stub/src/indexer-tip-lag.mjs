/**
 * Classify a third-party Preprod indexer tip against a public tip.
 * Uses only the documented GraphQL shape `{ block { height } }`.
 * Does not call an indexer and does not claim the public indexer or node is fixed.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/230
 * Official query: https://docs.midnight.network/guides/networks-and-environments
 * Public Preprod indexer named there:
 * https://indexer.preprod.midnight.network/api/v4/graphql
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/230';
export const DOCS = 'https://docs.midnight.network/guides/networks-and-environments';
export const PUBLIC_INDEXER = 'https://indexer.preprod.midnight.network/api/v4/graphql';
export const HEIGHT_QUERY = '{ block { height } }';

/** Heights named in servicedesk#230. Not a live measurement. */
export const REPORTED = Object.freeze({
  publicTip: 2825871,
  thirdPartyTip: 2797947,
  lagBlocks: 27924,
  stalledHours: 4,
  tx: 'e0f1b47301c0456d429b4059e4272396732cd140e02ff163692c3366d3874605',
  txBlock: 2821114,
  thirdPartyHost: 'api-preprod.1am.xyz',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function heightFromIndexerBody(body) {
  const height = body?.data?.block?.height;
  if (typeof height === 'number' && Number.isInteger(height) && height >= 0) return height;
  if (typeof height === 'string' && /^[0-9]+$/.test(height)) return Number(height);
  return null;
}

/**
 * @param {{ publicTip?: number, thirdPartyTip?: number, txBlock?: number, stalledHours?: number, thirdPartyHost?: string }} [input]
 */
export function classifyIndexerTipLag(input = {}) {
  const publicTip = input.publicTip;
  const thirdPartyTip = input.thirdPartyTip;
  const txBlock = input.txBlock ?? null;
  const stalledHours = input.stalledHours ?? null;
  const thirdPartyHost = input.thirdPartyHost ?? REPORTED.thirdPartyHost;

  if (!Number.isInteger(publicTip) || !Number.isInteger(thirdPartyTip)) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'Indexer tip sample incomplete',
      hint: `Need integer heights from the documented query ${HEIGHT_QUERY}. This helper does not query an indexer.`,
      upstream: UPSTREAM,
      docs: DOCS,
      query: HEIGHT_QUERY,
      credit: CREDIT,
    };
  }

  const lagBlocks = publicTip - thirdPartyTip;
  const txAboveThirdParty = Number.isInteger(txBlock) && txBlock > thirdPartyTip;
  const matchesReport =
    publicTip === REPORTED.publicTip &&
    thirdPartyTip === REPORTED.thirdPartyTip &&
    lagBlocks === REPORTED.lagBlocks;

  if (lagBlocks > 0 && (txAboveThirdParty || (stalledHours != null && stalledHours >= REPORTED.stalledHours))) {
    return {
      ok: true,
      classification: 'third-party-indexer-behind-public-tip',
      publicTip,
      thirdPartyTip,
      lagBlocks,
      txBlock,
      txAboveThirdParty,
      stalledHours,
      thirdPartyHost,
      matchesReport,
      title: 'Third-party Preprod indexer tip is behind the public tip',
      hint: 'A wallet pointed at the lagging host cannot see a shielded output whose block is above that tip. The official public indexer URL is unchanged. This classification does not restart 1AM and does not fix the public indexer or node.',
      publicIndexer: PUBLIC_INDEXER,
      upstream: UPSTREAM,
      docs: DOCS,
      query: HEIGHT_QUERY,
      claim: 'tip-lag classification only — not an indexer or node fix',
      credit: CREDIT,
    };
  }

  if (lagBlocks <= 0 && !txAboveThirdParty) {
    return {
      ok: true,
      classification: 'third-party-tip-not-behind',
      publicTip,
      thirdPartyTip,
      lagBlocks,
      title: 'Third-party tip is not behind the public tip in this sample',
      hint: 'A single sample is not a health check. This helper does not query an indexer.',
      upstream: UPSTREAM,
      docs: DOCS,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unexpected',
    publicTip,
    thirdPartyTip,
    lagBlocks,
    title: 'Indexer tip sample does not match a behind-public-tip stall',
    hint: 'Pass heights already observed. Do not invent a new GraphQL field.',
    upstream: UPSTREAM,
    docs: DOCS,
    credit: CREDIT,
  };
}

export const indexerTipLagCredit = CREDIT;
