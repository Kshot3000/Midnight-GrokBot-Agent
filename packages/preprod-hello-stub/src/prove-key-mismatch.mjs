/**
 * Prove-path classifier for a keys/circuit mismatch.
 * Does not call a proof server, wallet, indexer, or node.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1377
 * Official: https://docs.midnight.network/guides/local-proving
 *
 * The local-proving guide says the prover checks its own proof before
 * returning it. If keys and circuit do not match, the error says
 * "check that your keys match" rather than failing silently at submission.
 * The documented fix is to recompile. Stale build artifacts are the usual cause.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROVE_KEY_MISMATCH =
  'https://github.com/midnightntwrk/midnight-docs/issues/1377';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const PROOF_SERVER_PIN = '8.1.0';
export const DOCUMENTED_PHRASE = 'check that your keys match';
export const DOCUMENTED_FIX = 'Recompile the smart contract';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return [value.message, value.errorMessage, value.cause && value.cause.message]
      .filter(Boolean)
      .join(' ');
  }
  return String(value);
}

/**
 * @param {string | { message?: string, errorMessage?: string }} input
 */
export function classifyProveKeyMismatch(input) {
  const message = textOf(input);
  const lower = message.toLowerCase();
  const reasons = [];
  let kind = 'unknown';

  const keyMismatch = lower.includes(DOCUMENTED_PHRASE);
  const refused = /econnrefused|connect econnrefused/.test(lower);
  const compactAssert = /failed assert:/i.test(message) && !keyMismatch;
  const submission =
    /transaction submission error/i.test(message) ||
    /\b1010\b/.test(message) ||
    /exhaust the block limits/i.test(message);

  if (keyMismatch) {
    kind = 'key-mismatch';
    reasons.push(
      'local-proving: the prover verifies its own proof and says "check that your keys match" when keys and circuit differ',
    );
    reasons.push('documented cause: stale build artifacts; documented fix: recompile the smart contract');
    reasons.push('this is a prove-path failure, not a silent submission failure and not an indexer or node fault');
  } else if (refused) {
    kind = 'unreachable';
    reasons.push('ECONNREFUSED is a missing proof-server process, not a keys/circuit mismatch');
  } else if (compactAssert) {
    kind = 'compact-assert';
    reasons.push('a Compact failed assert is a circuit invariant, not the documented keys/circuit phrase');
  } else if (submission) {
    kind = 'submission';
    reasons.push('a submission or 1010 string is after prove; it is not the documented keys/circuit phrase');
  } else if (!message) {
    kind = 'empty';
    reasons.push('no error string to classify');
  } else {
    reasons.push('message does not contain the documented phrase "check that your keys match"');
  }

  return {
    kind,
    keyMismatch: kind === 'key-mismatch',
    phrase: DOCUMENTED_PHRASE,
    fix: kind === 'key-mismatch' ? DOCUMENTED_FIX : null,
    proofServerPin: PROOF_SERVER_PIN,
    official: OFFICIAL_LOCAL_PROVING,
    upstream: UPSTREAM_PROVE_KEY_MISMATCH,
    reasons,
    credit: CREDIT,
  };
}
