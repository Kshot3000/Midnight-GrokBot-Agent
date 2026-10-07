/**
 * Classify an indexer setup note against documented local URLs and the v4 query shape.
 * Upstream gap: https://github.com/midnightntwrk/midnight-docs/issues/285
 * Official API: https://docs.midnight.network/api-reference/midnight-indexer
 * Official local network: https://docs.midnight.network/guides/midnight-local-network
 *
 * Does not dial an indexer, does not invent a public operator guide, and does not
 * claim the public indexer or node is fixed.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_INDEXER_USABILITY = 'https://github.com/midnightntwrk/midnight-docs/issues/285';
export const OFFICIAL_INDEXER_V4 = 'https://docs.midnight.network/api-reference/midnight-indexer';
export const OFFICIAL_LOCAL_NETWORK = 'https://docs.midnight.network/guides/midnight-local-network';
export const OFFICIAL_BSHIP_COMPOSE = 'https://docs.midnight.network/tutorials/bship/test-suite';
export const LOCAL_INDEXER_HTTP = 'http://localhost:8088/api/v4/graphql';
export const LOCAL_INDEXER_WS = 'ws://localhost:8088/api/v4/graphql/ws';
export const LOCAL_NETWORK_IMAGE = 'midnightntwrk/indexer-standalone:4.0.1';
export const TUTORIAL_IMAGE = 'midnightntwrk/indexer-standalone:4.3.3';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(value) {
  return value == null ? '' : String(value);
}

/**
 * @param {{
 *   httpUrl?: string,
 *   wsUrl?: string,
 *   image?: string,
 *   query?: string,
 *   hasOperatorGuide?: boolean,
 * }} note
 */
export function classifyIndexerUsability(note = {}) {
  const httpUrl = textOf(note.httpUrl).trim();
  const wsUrl = textOf(note.wsUrl).trim();
  const image = textOf(note.image).trim();
  const query = textOf(note.query);
  const reasons = [];
  const warnings = [];

  if (note.hasOperatorGuide !== true) {
    reasons.push('midnight-docs#285 is still open: no operator guide next to the full-node page');
  }

  const httpOk = httpUrl === LOCAL_INDEXER_HTTP || httpUrl === 'http://127.0.0.1:8088/api/v4/graphql';
  const wsOk = wsUrl === LOCAL_INDEXER_WS || wsUrl === 'ws://127.0.0.1:8088/api/v4/graphql/ws';
  if (httpUrl && !httpOk) {
    warnings.push('HTTP URL is not the documented local GraphQL path /api/v4/graphql on port 8088');
  }
  if (wsUrl && !wsOk) {
    warnings.push('WebSocket URL is not the documented local path /api/v4/graphql/ws');
  }
  if (httpOk) reasons.push('HTTP URL matches the local-network GraphQL endpoint');
  if (wsOk) reasons.push('WebSocket URL matches the local-network subscription endpoint');

  if (image === LOCAL_NETWORK_IMAGE) {
    warnings.push('image matches midnight-local-network (indexer-standalone 4.0.1); battleship tutorial and indexer 4.3.3 notes use 4.3.3, and 4.0.x to 4.3.3 needs a re-index');
  } else if (image === TUTORIAL_IMAGE) {
    reasons.push('image matches the battleship tutorial pin indexer-standalone 4.3.3');
  } else if (image) {
    warnings.push('image is not one of the two documented pins (4.0.1 local-network page, 4.3.3 battleship tutorial)');
  }

  const usesV1 = /chainState/.test(query) && !/zswapState/.test(query);
  const usesV4 = /contractAction\s*\(/.test(query) && /\bstate\b/.test(query) && /zswapState/.test(query);
  if (usesV1) {
    warnings.push('query uses chainState from the older indexer reference; v4 contract actions expose state and zswapState');
  } else if (usesV4) {
    reasons.push('query matches the v4 contractAction shape (state, zswapState)');
  } else if (query) {
    warnings.push('query is not the documented v4 contractAction selection');
  }

  let kind = 'incomplete';
  if (usesV1) kind = 'stale-v1-query';
  else if (httpOk && wsOk && usesV4 && image === TUTORIAL_IMAGE) kind = 'local-v4-no-operator-guide';
  else if (httpOk && wsOk && usesV4) kind = 'local-v4-image-unpinned';

  return {
    kind,
    operatorGuideMissing: note.hasOperatorGuide !== true,
    httpOk,
    wsOk,
    usesV4,
    usesV1,
    reasons,
    warnings,
    localHttp: LOCAL_INDEXER_HTTP,
    localWs: LOCAL_INDEXER_WS,
    upstream: UPSTREAM_INDEXER_USABILITY,
    official: OFFICIAL_INDEXER_V4,
    publicIndexerFixed: false,
    credit: CREDIT,
  };
}
