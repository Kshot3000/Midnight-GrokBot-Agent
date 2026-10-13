/**
 * Map official proof-server error strings that midnight-js drops from the response body.
 * Uses only the names and statuses published on the official proof-server errors page.
 * Does not call a proof server, invent APIs, or claim a public indexer/node/proof-server fix.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
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

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Official WorkerPoolError / WorkError names from the proof-server errors page.
 * Body is available only when captured from logs or a future client; midnight-js 4.1.1 drops it.
 */
export const OFFICIAL_PROOF_ERRORS = [
  {
    name: 'JobQueueFull',
    status: 429,
    hint: 'Proof generation job queue is full. Wait and retry. Reduce parallel requests.',
  },
  {
    name: 'BadInput',
    status: 400,
    hint: 'Proof request input data is invalid. Check transaction data and that ZKIR/keys are readable (see built-in key cases).',
  },
  {
    name: 'InternalError',
    status: 500,
    hint: 'Internal proof generation error. Check proof-server logs and restart if it persists.',
  },
  {
    name: 'JobMissing',
    status: 428,
    hint: 'Referenced job not found. Job ID invalid or expired.',
  },
  {
    name: 'ChannelClosed',
    status: 500,
    hint: 'Internal work channel closed. Restart the proof server.',
  },
];

/**
 * @param {string} text body, log line, or error message
 * @returns {{ matched: string | null, hint: string, official: string, upstream: string }}
 */
export function mapOfficialProofError(text) {
  const raw = String(text || '');
  for (const err of OFFICIAL_PROOF_ERRORS) {
    const nameRe = new RegExp(err.name.replace(/([a-z])([A-Z])/g, '$1\\s*$2'), 'i');
    if (nameRe.test(raw) || (err.name === 'BadInput' && /bad input/i.test(raw))) {
      return {
        matched: err.name,
        hint: `${err.hint} (HTTP ${err.status}). Body may have been dropped by midnight-js 4.1.1 — check verbose logs.`,
        official: OFFICIAL_PROOF_SERVER_ERRORS,
        upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
      };
    }
  }
  if (/Failed Proof Server response/i.test(raw) && /400/.test(raw)) {
    return {
      matched: null,
      hint: 'Client reported 400 without body. On 8.x the body is often "bad input". Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true.',
      official: OFFICIAL_PROOF_SERVER_ERRORS,
      upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
    };
  }
  return {
    matched: null,
    hint: 'No official proof-server error name matched. See the official page for WorkerPoolError and WorkError.',
    official: OFFICIAL_PROOF_SERVER_ERRORS,
    upstream: UPSTREAM_PROOF_PROVIDER_ERROR,
  };
}

function selfCheck() {
  const a = mapOfficialProofError('bad input: `couldn\'t find built-in key increment`');
  const b = mapOfficialProofError('Job Queue full');
  const c = mapOfficialProofError('Failed Proof Server response: code="400"');
  const d = mapOfficialProofError('something else');
  const ok =
    a.matched === 'BadInput' &&
    b.matched === 'JobQueueFull' &&
    c.matched === null &&
    /verbose/i.test(c.hint) &&
    d.matched === null;
  console.log(ok ? 'PASS' : 'FAIL', a.matched, b.matched, c.matched);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
