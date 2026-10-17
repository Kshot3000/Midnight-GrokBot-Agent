/**
 * Classifies proof-server error messages reported by midnight-js 4.1.1
 * httpClientProvingProvider (servicedesk#243).
 *
 * Does not invent APIs. Does not call a proof server. Does not claim the
 * public indexer, node, or proof server is fixed. Lab pin: proof-server 8.1.0,
 * midnight-js 4.1.1.
 *
 * Official error reference:
 * https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Local proving guide (VERBOSE logs the reason):
 * https://docs.midnight.network/guides/local-proving
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_PROVIDER_ERROR =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_SERVER_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_LOCAL_PROVING =
  'https://docs.midnight.network/guides/local-proving';

/**
 * @param {unknown} err - thrown Error or message string
 * @returns {{ kind: string, note: string, upstream: string, docs: string[], body?: string, timeoutMs?: number }}
 */
export function classifyProofProviderError(err) {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const chain = [];
  let c = err;
  while (c && typeof c === 'object') {
    if (c.message) chain.push(String(c.message));
    c = c.cause;
  }
  const shown = chain.join(' <- ') || message;

  // Timeout reported as user abort (4.1.1 AbortError).
  if (/The user aborted a request/i.test(shown) || /AbortError/i.test(shown)) {
    return {
      kind: 'timeout-reported-as-abort',
      note: 'midnight-js 4.1.1 reports AbortSignal.timeout as "The user aborted a request." It is a timeout, not a user cancel. servicedesk#243.',
      upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
      docs: [OFFICIAL_LOCAL_PROVING, OFFICIAL_PROOF_SERVER_ERRORS],
    };
  }

  // Dropped body: only status, no server text.
  const statusMatch = shown.match(/Failed Proof Server response: url="([^"]+)", code="(\d+)", status="([^"]+)"/);
  if (statusMatch && !/body=/.test(shown)) {
    const [, url, code, status] = statusMatch;
    return {
      kind: 'body-dropped',
      note: `Proof provider dropped the response body (servicedesk#243). Status ${code} ${status} at ${url}. On 8.x the body is usually "bad input", "Job Queue full" or "internal error". Enable MIDNIGHT_PROOF_SERVER_VERBOSE to see the reason in logs.`,
      upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
      docs: [OFFICIAL_PROOF_SERVER_ERRORS, OFFICIAL_LOCAL_PROVING],
      code,
      status,
      url,
    };
  }

  // If body is somehow present (future or wallet SDK style).
  const bodyMatch = shown.match(/body="([^"]+)"/);
  if (bodyMatch) {
    return {
      kind: 'body-present',
      note: 'Body was included. This is the expected form after the fix tracked by servicedesk#243.',
      body: bodyMatch[1],
      upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
      docs: [OFFICIAL_PROOF_SERVER_ERRORS],
    };
  }

  if (/Job Queue full|bad input|internal error/i.test(shown)) {
    return {
      kind: 'server-text-visible',
      note: 'Server text is visible. Common 8.x bodies per official error reference.',
      upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
      docs: [OFFICIAL_PROOF_SERVER_ERRORS],
    };
  }

  return {
    kind: 'unclassified',
    note: 'Does not match the patterns in servicedesk#243. Check proof-server logs with MIDNIGHT_PROOF_SERVER_VERBOSE=true.',
    upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
    docs: [OFFICIAL_PROOF_SERVER_ERRORS, OFFICIAL_LOCAL_PROVING],
    shown,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cases = [
    classifyProofProviderError(new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"')),
    classifyProofProviderError(new Error('AbortError: The user aborted a request.')),
  ];
  console.log(JSON.stringify(cases, null, 2));
  if (cases[0].kind !== 'body-dropped' || cases[1].kind !== 'timeout-reported-as-abort') {
    process.exit(1);
  }
  console.log('self-check ok');
}
