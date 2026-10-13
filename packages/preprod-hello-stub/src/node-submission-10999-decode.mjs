/**
 * Decode common node submission-layer messages that official tables under-document.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1385
 * Related: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Official: https://docs.midnight.network/nodes/error-codes
 * Does not contact a node, indexer, or proof server.
 * Does not claim a fix of the public node or indexer.
 * Pins: midnight-js 4.1.1, Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1385';
export const RELATED = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/nodes/error-codes';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify a submission error string.
 * @param {string} text
 * @returns {{ kind: string, hint: string, code?: string }}
 */
export function decodeSubmissionLayer(text) {
  if (typeof text !== 'string') {
    return { kind: 'unknown', hint: 'Expected an error message string.' };
  }
  if (/TransactionInvalidError:\s*Transaction is invalid and was rejected by the node/i.test(text)) {
    return {
      kind: 'code-less-invalid',
      hint: 'Transaction passed pool validation but was dropped when the block was built. Common cause: two wallet instances on one seed (DUST double-spend while the first is still pending). Use one wallet instance per seed. No Custom code reaches the client (midnight-docs#1509).',
    };
  }
  if (/10999/.test(text)) {
    return {
      kind: 'submission-10999',
      hint: 'Submission-layer code 10999. Official node error-codes page currently focuses on LedgerApiError Custom(u8) values. Check the full SDK error string and node logs for the inner reason (midnight-docs#1385).',
    };
  }
  const custom = text.match(/Custom(?:\s+error)?[:\s]+(\d+)/i);
  if (custom) {
    return {
      kind: 'custom',
      code: custom[1],
      hint: `Ledger Custom(${custom[1]}). See the tables at ${OFFICIAL} for the name and fix. Codes can change between node releases; pin to the support matrix.`,
    };
  }
  if (/SubmissionError|Transaction submission error/i.test(text)) {
    return {
      kind: 'submission-wrapper',
      hint: 'SDK SubmissionError wrapper. Inspect the cause for a Custom code or the code-less TransactionInvalidError text.',
    };
  }
  return { kind: 'other', hint: 'No known submission-layer pattern matched.' };
}

function selfCheck() {
  const a = decodeSubmissionLayer('SubmissionError: Transaction submission error\n[cause]: TransactionInvalidError: Transaction is invalid and was rejected by the node');
  const b = decodeSubmissionLayer('Custom error: 196');
  const c = decodeSubmissionLayer('something 10999');
  const ok = a.kind === 'code-less-invalid' && b.kind === 'custom' && b.code === '196' && c.kind === 'submission-10999';
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.code, c.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
