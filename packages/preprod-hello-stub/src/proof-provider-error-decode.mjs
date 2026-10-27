/**
 * Decode the midnight-js http-client-proof-provider error shape reported by servicedesk#243.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Proof-server errors: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Install pin: https://docs.midnight.network/getting-started/installation
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PROOF_PROVIDER_DECODE =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_INSTALL = 'https://docs.midnight.network/getting-started/installation';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const FAILED_RESPONSE =
  /Failed Proof Server response: url="(?<url>[^"]+)", code="(?<code>\d+)", status="(?<status>[^"]+)"(?:\s*,\s*body="(?<body>[^"]*)")?/;

const ABORT =
  /AbortError: The user aborted a request\./;

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Classify a proof-provider error string from midnight-js 4.1.1.
 * The provider currently drops the response body; this only recovers text that is already present.
 * @param {unknown} error
 */
export function decodeProofProviderError(error) {
  const text = textOf(error).trim();
  const failed = text.match(FAILED_RESPONSE);
  const aborted = ABORT.test(text);

  if (failed) {
    const body = failed.groups.body || null;
    return {
      kind: 'failed-response',
      ok: true,
      url: failed.groups.url,
      code: Number(failed.groups.code),
      status: failed.groups.status,
      body,
      bodyDropped: body == null,
      hint: body
        ? `non-2xx included body: ${body}`
        : 'midnight-js 4.1.1 drops the proof-server body. The server message (bad input, Job Queue full, …) is not in this error. See servicedesk#243.',
      upstream: UPSTREAM_PROOF_PROVIDER_DECODE,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  if (aborted) {
    return {
      kind: 'abort',
      ok: true,
      timeout: true,
      hint: 'AbortError: The user aborted a request. On midnight-js 4.1.1 this is how a timeout surfaces; no duration is included. See servicedesk#243.',
      upstream: UPSTREAM_PROOF_PROVIDER_DECODE,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  return {
    kind: 'unrecognized',
    ok: false,
    hint: 'not the Failed Proof Server response or AbortError shape quoted in servicedesk#243.',
    upstream: UPSTREAM_PROOF_PROVIDER_DECODE,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const dropped =
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"';
  const withBody =
    'Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request", body="bad input"';
  const abort = 'AbortError: The user aborted a request.';
  const a = decodeProofProviderError(dropped);
  const b = decodeProofProviderError(withBody);
  const c = decodeProofProviderError(abort);
  const ok = a.bodyDropped && b.body === 'bad input' && c.timeout;
  if (!ok) {
    console.error(JSON.stringify({ a, b, c }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, bodyDropped: a.bodyDropped, credit: CREDIT }, null, 2));
}
