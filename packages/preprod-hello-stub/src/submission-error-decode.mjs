/**
 * Decode a wallet-SDK "Transaction submission error" wrapper.
 * Does not submit a transaction and does not claim a node or indexer fix.
 *
 * Official: https://docs.midnight.network/nodes/error-codes
 * Official: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Upstream wrapper: https://github.com/midnightntwrk/servicedesk/issues/225
 * Upstream missing code: https://github.com/midnightntwrk/midnight-docs/issues/1385
 * Upstream unsigned 1010: https://github.com/midnightntwrk/midnight-docs/issues/1509
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';
import { classifyUnsigned1010 } from './unsigned-1010-causes.mjs';

export const UPSTREAM_WRAPPER = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const UPSTREAM_CODES = 'https://github.com/midnightntwrk/midnight-docs/issues/1385';
export const OFFICIAL_CODES = 'https://docs.midnight.network/nodes/error-codes';
export const OFFICIAL_DECODE = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const UPSTREAM_UNSIGNED = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';

/**
 * Variants named on the official decode-1010 page. Codes can change between node releases.
 * 168 FeeCalculation is the retired code the same page calls out.
 */
export const NAMED_LEDGER_VARIANTS = Object.freeze({
  108: 'ReplayCounterMismatch',
  115: 'InvalidProof',
  126: 'Unbalanced',
  138: 'BalanceCheckOverspend',
  154: 'BlockLimitExceededError',
  155: 'FeeCalculationError',
  166: 'InvalidNetworkId',
  168: 'FeeCalculation',
  193: 'ReplayProtectionViolation',
  235: 'Zswap.Malformed.InvalidProof',
});

/** Submission-layer code midnight-docs#1385 says is missing from the node error codes page. */
export const UNLISTED_SUBMISSION_CODE = 10999;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const parts = [];
    const seen = new Set();
    const walk = (value, depth) => {
      if (value == null || depth > 4 || seen.has(value)) return;
      if (typeof value === 'string' || typeof value === 'number') {
        parts.push(String(value));
        return;
      }
      if (typeof value !== 'object') return;
      seen.add(value);
      if (Array.isArray(value)) {
        for (const item of value) walk(item, depth + 1);
        return;
      }
      for (const key of ['code', 'message', 'data', 'cause', 'name']) {
        if (key in value) walk(value[key], depth + 1);
      }
    };
    walk(error, 0);
    if (parts.length) return parts.join(' ');
  }
  return String(error);
}

/**
 * Pull 1010 / Custom error: N out of a wrapped submission failure.
 * @param {unknown} error
 */
export function decodeSubmissionError(error) {
  const text = textOf(error);
  const custom = text.match(/Custom error:\s*(\d+)/i);
  const unlisted = text.match(/\b10999\b/);
  const code = custom ? Number(custom[1]) : unlisted ? UNLISTED_SUBMISSION_CODE : null;
  const has1010 = /\b1010\b/.test(text) || /Invalid Transaction/i.test(text);
  const generic =
    /Transaction submission error/i.test(text) || /Transaction submission failed/i.test(text);
  const exhausts = /would exhaust the block limits/i.test(text);
  const named = code != null && Object.prototype.hasOwnProperty.call(NAMED_LEDGER_VARIANTS, code)
    ? NAMED_LEDGER_VARIANTS[code]
    : null;

  const base = {
    upstream: UPSTREAM_WRAPPER,
    codesIssue: UPSTREAM_CODES,
    official: OFFICIAL_CODES,
    decodeGuide: OFFICIAL_DECODE,
    unsignedIssue: UPSTREAM_UNSIGNED,
    claim: 'local classification of an already-observed error string — not a node fix',
    credit: CREDIT,
  };

  if (code === UNLISTED_SUBMISSION_CODE) {
    return {
      ...base,
      ok: true,
      classification: 'unlisted-submission-code',
      code,
      variant: null,
      hint: 'midnight-docs#1385: the node error codes page does not list submission-layer code 10999. This lab does not invent a variant name. Print String(error) and keep the raw text.',
    };
  }

  if (exhausts && generic && code == null) {
    return {
      ...base,
      ok: true,
      classification: 'block-limit-text-hidden',
      code: null,
      variant: null,
      hint: 'servicedesk#225: the wallet SDK surfaces RPC 1010 "Transaction would exhaust the block limits" only as "Transaction submission error". The official node error codes page says FiberFailure.message is the outer text and String(error) is required to see Custom error: N. Official decode-1010 names 154 BlockLimitExceededError and 155 FeeCalculationError for block-limit fee failures. Split the transaction; do not treat the outer string as the ledger variant.',
    };
  }

  if (named) {
    return {
      ...base,
      ok: true,
      classification: 'named-ledger-variant',
      code,
      variant: named,
      retired: code === 168,
      hint: code === 168
        ? 'Official decode-1010 says 168 FeeCalculation was retired and replaced by 155 FeeCalculationError. Confirm the node release before acting on the number.'
        : `Official decode-1010 names ${code} ${named}. Look up N on the node error codes page for the node your network is running. Variant numbers can change between releases.`,
    };
  }

  if (has1010 && code == null) {
    const unsigned = classifyUnsigned1010(text);
    const blockLimit = unsigned.kind === 'block-limit-no-u8';
    return {
      ...base,
      ok: true,
      classification: blockLimit ? 'block-limit-no-u8' : 'unsigned-1010-no-inner-u8',
      code: null,
      variant: null,
      appliesSignedExtrinsicCauses: false,
      hint: blockLimit
        ? unsigned.hint
        : 'midnight-docs#1509: a 1010 with no Custom error: N is not a bad signature, stale era, or wrong nonce. Those checks are on signed extrinsics. Midnight transactions go in as the unsigned send_mn_transaction call. The no-u8 sentence builders hit is "Transaction would exhaust the block limits" (servicedesk#225). This sample has neither that sentence nor an inner u8. Do not rebuild for a nonce. This decoder does not fix the public node.',
    };
  }

  if (generic && code == null) {
    return {
      ...base,
      ok: true,
      classification: 'outer-wrapper-only',
      code: null,
      variant: null,
      hint: 'Official node error codes: SubmissionError: Transaction submission error is the wallet SDK outer wrapper. String(error) is required; JSON.stringify drops the node text. This sample has no Custom error: N yet.',
    };
  }

  return {
    ...base,
    ok: false,
    classification: 'unclassified',
    code,
    variant: named,
    hint: 'No submission wrapper, 1010 envelope, or Custom error: N. This helper does not query a node.',
  };
}

export const submissionErrorCredit = CREDIT;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const hidden = decodeSubmissionError(
    '(FiberFailure) SubmissionError: Transaction submission error: Transaction would exhaust the block limits',
  );
  const named = decodeSubmissionError('1010: Invalid Transaction: Custom error: 154');
  const missing = decodeSubmissionError('submission layer code 10999');
  const bare = decodeSubmissionError({ code: 1010, message: 'Invalid Transaction', data: 'Transaction would exhaust the block limits' });
  const ok = hidden.classification === 'block-limit-text-hidden'
    && named.variant === 'BlockLimitExceededError'
    && missing.classification === 'unlisted-submission-code'
    && bare.classification === 'block-limit-no-u8'
    && bare.appliesSignedExtrinsicCauses === false;
  if (!ok) {
    console.error(JSON.stringify({ hidden, named, missing }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, classification: hidden.classification, credit: CREDIT }, null, 2));
}
