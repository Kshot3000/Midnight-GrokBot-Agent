/**
 * Classify proof-provider errors that drop the body or report a timeout as an abort,
 * mapped to the official common-issues table.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not invent APIs. Official docs only.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') {
    return `${error.name || 'Error'}: ${error.message}`;
  }
  return String(error);
}

/**
 * Classify a proof-provider or proof-server error string against the official table.
 * @param {unknown} error
 * @param {{ body?: string, timeoutMs?: number }} [hints]
 */
export function decodeCommonIssues(error, hints = {}) {
  const text = textOf(error);
  const body = typeof hints.body === 'string' ? hints.body.toLowerCase() : '';

  if (/aborterror/i.test(text) && /aborted a request/i.test(text)) {
    return {
      kind: 'timeout-as-abort',
      officialSymptom: 'Slow proof generation / client timeout',
      hint: 'Reported as AbortError. Raise the httpClientProofProvider timeout (default 300000 ms). Upstream #243.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  if (/Failed Proof Server response/i.test(text) && /code="400"/i.test(text)) {
    let cause = 'body dropped by midnight-js 4.1.1';
    if (body.includes('bad input')) cause = 'BadInput (malformed transaction or missing key)';
    else if (body.includes('job queue full') || body.includes('jobqueuefull')) cause = 'JobQueueFull';
    return {
      kind: 'body-dropped-400',
      officialSymptom: '400 Bad Request / BadInput',
      cause,
      hint: 'Body not included. Check proof-server logs or set MIDNIGHT_PROOF_SERVER_VERBOSE=true. Official: BadInput or JobQueueFull. Upstream #243.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  if (/429|Job Queue full|JobQueueFull/i.test(text) || body.includes('job queue full')) {
    return {
      kind: 'queue-full',
      officialSymptom: '429 responses',
      hint: 'Too many concurrent requests. Reduce parallel proves and back off. Official common issues table.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  if (/connection refused|ECONNREFUSED|port 6300/i.test(text)) {
    return {
      kind: 'not-running',
      officialSymptom: 'Connection refused on port 6300',
      hint: 'Proof server not running. Start midnightntwrk/proof-server:8.1.0. Official common issues table.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }

  return {
    kind: 'other',
    hint: 'Not matched to the common issues or #243 shapes. See the official error reference.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const abort = Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
  const fourHundred = new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
  const refused = new Error('connect ECONNREFUSED 127.0.0.1:6300');
  const a = decodeCommonIssues(abort);
  const b = decodeCommonIssues(fourHundred, { body: 'bad input' });
  const c = decodeCommonIssues(refused);
  const ok = a.kind === 'timeout-as-abort' && b.kind === 'body-dropped-400' && c.kind === 'not-running';
  if (!ok) {
    console.error(JSON.stringify({ a, b, c }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, kinds: [a.kind, b.kind, c.kind], upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
