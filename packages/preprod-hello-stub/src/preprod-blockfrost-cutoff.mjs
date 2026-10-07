/**
 * Classify Preprod endpoint and HTTP failures around the hosted-to-Blockfrost move.
 * Official docs (read 2026-10-07) still list Midnight-hosted Preprod URLs and say
 * they need no token. midnight-docs#1504 says those hosts shut down Fri 9 Oct 2026
 * 18:00 ET / 22:00 UTC and proposes Blockfrost URLs. This helper does not call
 * either host and does not claim the public indexer or node is fixed.
 *
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1504
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1504';
export const DOCS = 'https://docs.midnight.network/guides/networks-and-environments';

/** Hosts named on the official networks page as of 2026-10-07. */
export const HOSTED = Object.freeze({
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  nodeWS: 'wss://rpc.preprod.midnight.network',
});

/**
 * URLs proposed in midnight-docs#1504. Not yet on the official networks page.
 * A token belongs in the environment, never in source.
 */
export const PROPOSED_BLOCKFROST = Object.freeze({
  node: 'https://rpc.midnight-preprod.blockfrost.io',
  nodeWS: 'wss://rpc.midnight-preprod.blockfrost.io',
  indexer: 'https://midnight-preprod.blockfrost.io/api/v0',
  indexerWS: 'wss://midnight-preprod.blockfrost.io/api/v0/ws',
  tokenEnv: 'BLOCKFROST_PROJECT_ID',
  tokenQuery: 'project_id',
});

/** Shutdown named in midnight-docs#1504. Preview is unchanged in that issue. */
export const CUTOFF = Object.freeze({
  utc: '2026-10-09T22:00:00Z',
  label: 'Fri 9 Oct 2026, 18:00 ET / 22:00 UTC',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  const parts = [error.message, error.code, error.cause?.message, error.cause?.code];
  return parts.filter(Boolean).join(' ');
}

/**
 * @param {string} url
 */
export function classifyPreprodUrl(url) {
  const value = String(url || '');
  const hosted = /indexer\.preprod\.midnight\.network|rpc\.preprod\.midnight\.network/.test(value);
  const blockfrost = /midnight-preprod\.blockfrost\.io|rpc\.midnight-preprod\.blockfrost\.io/.test(value);
  const oldIndexerPath = /\/api\/v4\/graphql/.test(value);
  const blockfrostPath = /\/api\/v0(\/ws)?/.test(value);
  const hasToken = /[?&]project_id=/.test(value);
  return { hosted, blockfrost, oldIndexerPath, blockfrostPath, hasToken };
}

/**
 * @param {{ url?: string, status?: number, error?: unknown, body?: string, now?: string }} input
 */
export function decodePreprodEndpointError(input = {}) {
  const url = input.url || '';
  const status = input.status ?? null;
  const body = typeof input.body === 'string' ? input.body : '';
  const blob = `${textOf(input.error)} ${body}`;
  const where = classifyPreprodUrl(url);
  const base = {
    upstream: UPSTREAM,
    docs: DOCS,
    cutoff: CUTOFF,
    hosted: HOSTED,
    proposed: PROPOSED_BLOCKFROST,
    claim: 'endpoint classification only — not an indexer or node fix',
    credit: CREDIT,
  };

  if (/ENOTFOUND|getaddrinfo/i.test(blob) && where.hosted) {
    return {
      ...base,
      ok: true,
      classification: 'hosted-preprod-hostname-unresolved',
      title: 'Midnight-hosted Preprod hostname did not resolve',
      hint: `Official docs still list ${HOSTED.indexer} and ${HOSTED.node}. midnight-docs#1504 says those hosts stop at ${CUTOFF.label}. A resolver failure is consistent with that shutdown, not proof it has happened. Do not invent a replacement until the networks page changes.`,
    };
  }

  if (status === 403 && /Missing project token/i.test(blob)) {
    return {
      ...base,
      ok: true,
      classification: 'blockfrost-missing-project-token',
      title: 'Blockfrost rejected the request: missing project token',
      hint: `Append ?${PROPOSED_BLOCKFROST.tokenQuery}= from ${PROPOSED_BLOCKFROST.tokenEnv}. The official mainnet migration table uses the same 403 text. Do not commit the token.`,
    };
  }

  if (status === 403 && /Network token mismatch/i.test(blob)) {
    return {
      ...base,
      ok: true,
      classification: 'blockfrost-network-token-mismatch',
      title: 'Blockfrost rejected a token for another network',
      hint: 'midnight-docs#1504 says a preprod token is rejected on mainnet and the other way round. Use a Midnight Preprod project token on the preprod hosts only.',
    };
  }

  if (where.blockfrost && where.oldIndexerPath) {
    return {
      ...base,
      ok: true,
      classification: 'blockfrost-old-indexer-path',
      title: 'Blockfrost URL still uses the Midnight-hosted indexer path',
      hint: 'midnight-docs#1504 says the indexer path changes from /api/v4/graphql to /api/v0 (WebSocket /api/v0/ws). Official docs still document /api/v4/graphql for the Midnight-hosted host.',
    };
  }

  if (where.hosted) {
    return {
      ...base,
      ok: true,
      classification: 'still-on-hosted-preprod',
      title: 'URL is still a Midnight-hosted Preprod endpoint',
      hint: `That matches the official networks page as of 2026-10-07. midnight-docs#1504 asks docs to switch before ${CUTOFF.label}. Preview hosts are unchanged in that issue.`,
    };
  }

  return {
    ...base,
    ok: false,
    classification: 'unclassified',
    title: 'Preprod endpoint sample did not match a hosted or proposed-Blockfrost failure',
    hint: 'Pass the URL and the HTTP status or error text you already observed. This helper does not query an indexer or node.',
  };
}

export const preprodBlockfrostCredit = CREDIT;
