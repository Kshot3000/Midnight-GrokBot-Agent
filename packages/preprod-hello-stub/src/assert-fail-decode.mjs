/**
 * Decode the bulletin-board "failed assert" wrapper printed by the example CLI.
 * Does not call a proof server, wallet, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Example error: https://docs.midnight.network/examples/dapps/bboard
 * Proof-server errors: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Install pin: https://docs.midnight.network/getting-started/installation
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_ASSERT_DECODE = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_BBOARD = 'https://docs.midnight.network/examples/dapps/bboard';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';
export const OFFICIAL_INSTALL = 'https://docs.midnight.network/getting-started/installation';

/** Messages quoted by the bulletin board contract and example, not the test-and-debug samples. */
export const BBOARD_ASSERTS = Object.freeze({
  postOccupied: 'Attempted to post to an occupied board',
  takeDownVacant: 'Attempted to take down post from an empty board',
  takeDownNotOwner: 'Attempted to take down post, but not the current owner',
});

/** Expectations still on the test-and-debug page, called out by midnight-docs#1487. */
export const STALE_SAMPLE_EXPECTATIONS = Object.freeze({
  'Board is occupied': BBOARD_ASSERTS.postOccupied,
  'Board is vacant': BBOARD_ASSERTS.takeDownVacant,
  'Not authorized': BBOARD_ASSERTS.takeDownNotOwner,
});

export const LAB_PROOF_SERVER = 'midnightntwrk/proof-server:8.1.0';
export const EXAMPLE_PROOF_SERVER = 'midnightntwrk/proof-server:8.0.3';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const SCOPED_ASSERT =
  /Unexpected error executing scoped transaction '(?<scope>[^']*)': Error: failed assert: (?<message>.+)$/;

const PROOF_SERVER_ERRORS = [
  'JobNotPending',
  'JobMissing',
  'JobQueueFull',
  'ChannelClosed',
  'BadInput',
  'CancelledUnexpectedly',
  'InternalError',
  'JoinError',
];

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') return error.message;
  return String(error);
}

/**
 * Pull a Compact assert out of the example CLI wrapper.
 * A proof-server HTTP error is not a contract invariant failure.
 * @param {unknown} error
 */
export function decodeFailedAssert(error) {
  const text = textOf(error).replace(/^Found error\s+/i, '').replace(/^['"]|['"]$/g, '').trim();
  const proofServerHit = PROOF_SERVER_ERRORS.find((name) => text.includes(name));
  const match = text.match(SCOPED_ASSERT);
  const message = match ? match.groups.message.trim() : null;
  const known = message ? Object.entries(BBOARD_ASSERTS).find(([, value]) => value === message) : null;

  if (proofServerHit && !message) {
    return {
      kind: 'proof-server',
      ok: false,
      proofServerError: proofServerHit,
      message: null,
      hint: `${proofServerHit} is a proof-server work or worker-pool error, not a Compact assert. See the proof-server error reference. Do not treat it as a bulletin-board invariant.`,
      upstream: UPSTREAM_ASSERT_DECODE,
      official: OFFICIAL_PROOF_ERRORS,
      credit: CREDIT,
    };
  }

  if (!message) {
    return {
      kind: 'unrecognized',
      ok: false,
      message: null,
      hint: 'no "failed assert:" wrapper. The bulletin board example prints Unexpected error executing scoped transaction \'<unnamed>\': Error: failed assert: <message>.',
      upstream: UPSTREAM_ASSERT_DECODE,
      official: OFFICIAL_BBOARD,
      credit: CREDIT,
    };
  }

  return {
    kind: known ? 'compact-assert' : 'compact-assert-unlisted',
    ok: true,
    scope: match.groups.scope,
    invariant: known ? known[0] : null,
    message,
    hint: known
      ? `Compact assert fired before submission: ${message}`
      : `Compact assert text is not one of the three bulletin-board messages documented on the example page: ${message}`,
    upstream: UPSTREAM_ASSERT_DECODE,
    official: OFFICIAL_BBOARD,
    credit: CREDIT,
  };
}

/**
 * The test-and-debug samples expect strings the bulletin board contract does not use.
 * @param {string} expected
 */
export function classifySampleExpectation(expected) {
  const raw = String(expected || '').trim();
  const mapped = STALE_SAMPLE_EXPECTATIONS[raw];
  if (!mapped) {
    const live = Object.values(BBOARD_ASSERTS).includes(raw);
    return {
      ok: live,
      stale: false,
      expected: raw,
      contractMessage: live ? raw : null,
      upstream: UPSTREAM_ASSERT_DECODE,
      official: OFFICIAL_BBOARD,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    stale: true,
    expected: raw,
    contractMessage: mapped,
    hint: `midnight-docs#1487: sample expects '${raw}', but the bulletin board contract message is '${mapped}'`,
    upstream: UPSTREAM_ASSERT_DECODE,
    official: OFFICIAL_BBOARD,
    credit: CREDIT,
  };
}

/**
 * The bulletin board example still starts proof-server 8.0.3. Install docs pin 8.1.0.
 * This lab does not change that example.
 * @param {string} command
 */
export function classifyProofServerStart(command) {
  const raw = String(command || '');
  if (raw.includes(EXAMPLE_PROOF_SERVER)) {
    return {
      ok: false,
      image: EXAMPLE_PROOF_SERVER,
      hint: `example starts ${EXAMPLE_PROOF_SERVER}; install docs and this lab pin ${LAB_PROOF_SERVER}. This does not patch the example.`,
      upstream: UPSTREAM_ASSERT_DECODE,
      official: OFFICIAL_INSTALL,
      credit: CREDIT,
    };
  }
  if (raw.includes(LAB_PROOF_SERVER)) {
    return {
      ok: true,
      image: LAB_PROOF_SERVER,
      hint: `matches install docs: docker run -p 6300:6300 ${LAB_PROOF_SERVER} midnight-proof-server -v`,
      upstream: UPSTREAM_ASSERT_DECODE,
      official: OFFICIAL_INSTALL,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    image: null,
    hint: `no proof-server image. Lab pin is ${LAB_PROOF_SERVER}.`,
    upstream: UPSTREAM_ASSERT_DECODE,
    official: OFFICIAL_INSTALL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample =
    "Found error 'Unexpected error executing scoped transaction '<unnamed>': Error: failed assert: Attempted to post to an occupied board'";
  const decoded = decodeFailedAssert(sample);
  const stale = classifySampleExpectation('Not authorized');
  const image = classifyProofServerStart(
    'docker run -p 6300:6300 midnightntwrk/proof-server:8.0.3 -- midnight-proof-server -v',
  );
  const ok = decoded.ok && decoded.invariant === 'postOccupied' && stale.stale && !image.ok;
  if (!ok) {
    console.error(JSON.stringify({ decoded, stale, image }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, invariant: decoded.invariant, credit: CREDIT }, null, 2));
}
