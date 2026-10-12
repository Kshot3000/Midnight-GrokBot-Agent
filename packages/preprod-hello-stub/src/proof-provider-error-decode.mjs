/**
 * Decode incomplete errors from @midnight-ntwrk/midnight-js-http-client-proof-provider
 * when the proof server rejects a request or times out.
 * midnight-js 4.1.1 (and 5.0.0-rc.4) drops the response body and reports timeouts
 * as "The user aborted a request." This helper names the known shapes from the
 * official proof-server error page without calling the provider or inventing APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Official client: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-http-client-proof-provider/functions/httpClientProofProvider
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_PROVIDER_ERROR = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_SERVER_ERRORS = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function flatten(error) {
  const parts = [];
  const seen = new Set();
  const visit = (value, depth) => {
    if (value == null || depth > 6 || seen.has(value)) return;
    if (typeof value === 'string') {
      parts.push(value);
      return;
    }
    if (typeof value !== 'object') return;
    seen.add(value);
    if (typeof value.message === 'string') parts.push(value.message);
    if (typeof value.name === 'string') parts.push(value.name);
    if (value.cause) visit(value.cause, depth + 1);
    for (const key of Object.getOwnPropertyNames(value)) visit(value[key], depth + 1);
  };
  visit(error, 0);
  return parts.join('\n');
}

/**
 * Map the incomplete proof-provider errors from servicedesk#243.
 * @param {unknown} error
 * @param {{ timeoutMs?: number }} [hints]
 */
export function decodeProofProviderError(error, hints = {}) {
  const text = flatten(error);
  const notes = [];
  let kind = 'unknown';

  if (/Failed Proof Server response/.test(text) && /code=["']?400["']?/.test(text) && /Bad Request/.test(text)) {
    kind = 'bad-input-dropped-body';
    notes.push(
      'proof provider returned 400 Bad Request but dropped the response body. On proof-server 8.x the body is "bad input" (or "Job Queue full" / "internal error"). On 9.x it includes the reason, e.g. bad input: `couldn\'t find built-in key increment` when ZKIR is missing. Check zk-config / keys and the official proof-server error page.',
    );
    if (/Job Queue full/i.test(text) || /queue full/i.test(text)) {
      kind = 'queue-full';
      notes.push('body likely "Job Queue full" — proof server busy; retry later or increase capacity.');
    }
    if (/internal error/i.test(text)) {
      kind = 'internal-error-dropped-body';
      notes.push('body likely "internal error" — proof server failed internally; check server logs (verbose via MIDNIGHT_PROOF_SERVER_VERBOSE=true) and official proof-server error page.');
    }
    if (/couldn\'t find built-in key|zkir|ZKIR/i.test(text)) {
      kind = 'zkir-missing';
      notes.push('body likely mentions missing built-in key or ZKIR — ensure circuit IR/keys are readable by the provider.');
    }
  }

  if (/user aborted a request/i.test(text) || /AbortError/.test(text)) {
    kind = 'timeout-as-abort';
    const ms = hints.timeoutMs != null ? hints.timeoutMs : 300000;
    notes.push(
      `timeout (default ${ms} ms in midnight-js 4.1.1) was reported as AbortError: The user aborted a request. The official client uses AbortSignal.timeout; the body/reason is not included.`,
    );
  }

  if (/Proof Server request failed/.test(text) && /AbortError/.test(text)) {
    kind = 'timeout-as-abort';
    notes.push('5.0.0-rc.4 wraps the same abort as Proof Server request failed. Still no timeout duration or server body.');
  }

  return {
    ok: notes.length === 0,
    kind,
    notes,
    upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
    official: OFFICIAL_PROOF_SERVER_ERRORS,
    credit: CREDIT,
  };
}

/**
 * Suggest the missing body text for the common 8.x / 9.x shapes cited upstream.
 * Does not fetch from a live server.
 * @param {string} statusText
 * @param {string} [body]
 */
export function suggestProofServerBody(statusText, body) {
  const raw = String(body || '');
  if (/bad input/i.test(raw) || /Bad Request/i.test(statusText)) {
    if (/couldn\'t find built-in key/i.test(raw)) {
      return raw || 'bad input: `couldn\'t find built-in key increment` (ZKIR missing; body dropped by midnight-js-http-client-proof-provider 4.1.1)';
    }
    if (/Job Queue full/i.test(raw)) {
      return raw || 'Job Queue full (body dropped by midnight-js-http-client-proof-provider 4.1.1)';
    }
    if (/internal error/i.test(raw)) {
      return raw || 'internal error (body dropped by midnight-js-http-client-proof-provider 4.1.1)';
    }
    return raw || 'bad input (body dropped by midnight-js-http-client-proof-provider 4.1.1)';
  }
  return raw || '(no body captured)';
}
