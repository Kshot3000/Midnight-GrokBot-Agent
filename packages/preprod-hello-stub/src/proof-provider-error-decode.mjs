/**
 * proof-provider-error-decode.mjs
 *
 * Classifies the truncated error surface reported by
 * @midnight-ntwrk/midnight-js-http-client-proof-provider when the proof server
 * rejects a request or the client times out.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 *
 * Official docs (https://docs.midnight.network/guides/run-proof-server and
 * https://docs.midnight.network/guides/local-proving) describe running a local
 * proof server on port 6300. They do not document the HTTP error body shape.
 * This helper only classifies strings that midnight-js already surfaces.
 * It does not call the proof server, does not invent response schemas, and
 * does not claim a fix of midnight-js, the proof server, or any public node.
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/servicedesk/issues/243';

/** Patterns midnight-js 4.1.1 is reported to emit (issue #243). */
export const SURFACED_PATTERNS = Object.freeze({
  failedResponse: /Failed Proof Server response:\s*url="([^"]*)",\s*code="(\d+)",\s*status="([^"]*)"/i,
  aborted: /The user aborted a request\./i,
  // Bodies the issue says the server returns (8.x) but midnight-js currently drops.
  knownBodies: Object.freeze(['bad input', 'Job Queue full', 'internal error']),
});

/**
 * Classify a proof-provider error string.
 * Returns a plain object; never throws.
 *
 * @param {unknown} raw
 * @returns {{
 *   kind: 'failed-response' | 'aborted' | 'unknown',
 *   code: string | null,
 *   status: string | null,
 *   url: string | null,
 *   bodyHint: string | null,
 *   note: string
 * }}
 */
export function classifyProofProviderError(raw) {
  const text = String(raw ?? '');
  const failed = text.match(SURFACED_PATTERNS.failedResponse);
  if (failed) {
    return {
      kind: 'failed-response',
      code: failed[2],
      status: failed[3],
      url: failed[1],
      bodyHint: null,
      note: 'midnight-js 4.1.1 drops the proof-server response body; only the status line is kept (servicedesk#243).',
    };
  }
  if (SURFACED_PATTERNS.aborted.test(text)) {
    return {
      kind: 'aborted',
      code: null,
      status: null,
      url: null,
      bodyHint: null,
      note: 'AbortSignal.timeout surfaces as "The user aborted a request." (servicedesk#243).',
    };
  }
  const body = SURFACED_PATTERNS.knownBodies.find((b) => text.includes(b));
  return {
    kind: 'unknown',
    code: null,
    status: null,
    url: null,
    bodyHint: body ?? null,
    note: body
      ? 'Body text present; midnight-js 4.1.1 normally drops it (servicedesk#243).'
      : 'Unrecognized proof-provider error string.',
  };
}

export default classifyProofProviderError;
