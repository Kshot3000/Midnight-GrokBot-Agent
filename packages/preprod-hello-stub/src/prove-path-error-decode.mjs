/**
 * Prove-path error decoder for the local hello increment circuit.
 * Surfaces the dropped response body and timeout-as-abort shapes reported for
 * @midnight-ntwrk/midnight-js-http-client-proof-provider 4.1.1, plus official
 * proof-server HTTP statuses from the docs (WorkerPoolError / WorkError).
 * Does not call a proof server, does not invent APIs, does not claim a fix of
 * the public proof server, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL = 'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(err) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  const msg = err.message || '';
  const cause = err.cause ? ' <- ' + textOf(err.cause) : '';
  return `${err.name || 'Error'}: ${msg}${cause}`;
}

/**
 * Decode a prove-path failure for the hello increment circuit.
 * @param {unknown} error
 * @param {{ timeoutMs?: number }} [opts]
 */
export function decodeProvePathError(error, opts = {}) {
  const text = textOf(error);
  const notes = [];
  let kind = 'unknown';

  if (/Failed Proof Server response/.test(text) && /Bad Request/.test(text)) {
    kind = 'dropped-body';
    notes.push('midnight-js 4.1.1 dropped the proof-server response body. On 8.x this is usually "bad input". On 9.x it may contain "couldn\'t find built-in key increment" when ZKIR is missing.');
    if (/couldn.t find built-in key/i.test(text)) {
      notes.push('ZKIR/keys for increment were not readable by the provider. Check contracts/hello-midnight/out artifacts.');
    }
  }

  if (/AbortError/.test(text) || /user aborted a request/i.test(text)) {
    kind = 'timeout-as-abort';
    const ms = opts.timeoutMs ?? 300000;
    notes.push(`Timeout after ~${ms} ms was reported as AbortError. No duration appears in the message.`);
  }

  if (/Proof Server request failed/.test(text) && /AbortError/.test(text)) {
    kind = 'timeout-as-abort-rc';
    notes.push('5.0.0-rc.4 wraps the abort; still no body or timeout duration.');
  }

  // Official proof-server HTTP statuses (do not invent; from docs page)
  if (/code="429"|Too Many Requests|JobQueueFull/i.test(text)) {
    kind = kind === 'unknown' ? 'job-queue-full' : kind;
    notes.push('Official WorkerPoolError: JobQueueFull (429). Wait and retry; server under load.');
  }
  if (/code="400"|BadInput|bad input/i.test(text) && kind !== 'dropped-body') {
    kind = 'work-bad-input';
    notes.push('Official WorkError: BadInput (400). Check transaction data sent for proving.');
  }
  if (/code="500"|Internal Server Error|InternalError|ChannelClosed/i.test(text)) {
    kind = kind === 'unknown' ? 'proof-server-internal' : kind;
    notes.push('Official 500: InternalError / ChannelClosed / JoinError. Check proof-server logs; restart if it persists.');
  }
  if (/code="428"|Precondition Required|JobMissing/i.test(text)) {
    kind = 'job-missing';
    notes.push('Official WorkerPoolError: JobMissing (428). Job ID invalid or expired.');
  }

  return {
    kind,
    notes,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const samples = [
    new Error('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"'),
    Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' }),
    new Error('Failed Proof Server response: url="http://127.0.0.1:6300/prove", code="429", status="Too Many Requests"'),
  ];
  for (const s of samples) {
    console.log(JSON.stringify(decodeProvePathError(s), null, 2));
  }
  console.log(CREDIT);
}
