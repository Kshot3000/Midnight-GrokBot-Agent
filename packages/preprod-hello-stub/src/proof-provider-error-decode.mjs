/**
 * Classify the error shapes that midnight-js 4.1.1 proof provider emits
 * when the proof server rejects or times out.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const DROPPED_BODY =
  /Failed Proof Server response: url="(?<url>[^"]+)", code="(?<code>\d+)", status="(?<status>[^"]+)"/;

const ABORT =
  /AbortError: The user aborted a request\.|Proof Server request failed: url="[^"]+" <- AbortError: The user aborted a request\./;

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const parts = [];
    for (let c = error; c; c = c.cause) {
      if (typeof c.message === 'string') parts.push(c.message);
      else if (typeof c === 'string') parts.push(c);
      if (!c.cause) break;
    }
    return parts.join(' <- ') || String(error);
  }
  return String(error);
}

/**
 * @param {unknown} error
 */
export function decodeProofProviderError(error) {
  const text = textOf(error);
  const drop = text.match(DROPPED_BODY);
  if (drop) {
    return {
      kind: 'dropped-body',
      ok: false,
      url: drop.groups.url,
      code: drop.groups.code,
      status: drop.groups.status,
      bodyPresent: false,
      hint: 'midnight-js proof provider (4.1.1 / 5.0.0-rc) omitted the proof-server response body. On 8.x the body is usually "bad input"; on 9.x it includes the reason. See servicedesk#243.',
      upstream: UPSTREAM,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }
  if (ABORT.test(text)) {
    return {
      kind: 'timeout-as-abort',
      ok: false,
      bodyPresent: false,
      hint: 'AbortSignal.timeout surfaced as "The user aborted a request." Nothing names the configured timeout. See servicedesk#243.',
      upstream: UPSTREAM,
      official: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }
  if (/bad input/.test(text)) {
    return {
      kind: 'body-present',
      ok: true,
      hint: 'response body text is present in the error (not the dropped form).',
      upstream: UPSTREAM,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }
  return {
    kind: 'unrecognized',
    ok: false,
    hint: 'does not match the known midnight-js proof-provider shapes from servicedesk#243.',
    upstream: UPSTREAM,
    official: OFFICIAL_PROOF_ERRORS,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const dropped = decodeProofProviderError(
    'Error: Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"',
  );
  const abort = decodeProofProviderError('AbortError: The user aborted a request.');
  const ok = dropped.kind === 'dropped-body' && abort.kind === 'timeout-as-abort';
  if (!ok) {
    console.error(JSON.stringify({ dropped, abort }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kinds: [dropped.kind, abort.kind], credit: CREDIT }, null, 2));
}
