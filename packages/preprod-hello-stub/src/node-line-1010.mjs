/**
 * Classify a Custom error: N against the public node 1.0.x table.
 * Does not submit a transaction and does not claim a node or indexer fix.
 *
 * Official: https://docs.midnight.network/nodes/error-codes
 * Official: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Upstream wrapper: https://github.com/midnightntwrk/servicedesk/issues/225
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_ISSUE = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL_CODES = 'https://docs.midnight.network/nodes/error-codes';
export const OFFICIAL_DECODE = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const PUBLIC_NODE_LINE = '1.0.x';

/**
 * Names copied from the official node error codes page for node version 1.0.x.
 * Not a 2.x table. 168 FeeCalculation is listed there; it is not retired on that page.
 */
export const NODE_1_0_CODES = Object.freeze({
  154: 'BlockLimitExceededError',
  155: 'FeeCalculationError',
  168: 'FeeCalculation',
  182: 'TransactionApplicationError',
  186: 'EffectsCheckFailure',
  193: 'ReplayProtectionViolation',
  196: 'DustDoubleSpend',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {number} code
 * @param {string} [nodeLine]
 */
export function classifyNodeLine1010(code, nodeLine = PUBLIC_NODE_LINE) {
  const onPublicLine = nodeLine === PUBLIC_NODE_LINE;
  const variant = onPublicLine && Object.prototype.hasOwnProperty.call(NODE_1_0_CODES, code)
    ? NODE_1_0_CODES[code]
    : null;
  const retiredOnPublicLine = false;
  return {
    upstream: UPSTREAM_ISSUE,
    official: OFFICIAL_CODES,
    decodeGuide: OFFICIAL_DECODE,
    nodeLine,
    code,
    variant,
    retired: onPublicLine ? retiredOnPublicLine : null,
    claim: 'local classification against the published 1.0.x table — not a node fix',
    hint: code === 168 && onPublicLine
      ? 'Official node error codes lists 168 FeeCalculation for node version 1.0.x. The decode-1010 page still pairs 168 with 155 FeeCalculationError. midnight-docs#1509 says those tables were checked against node 1.0.400. Do not treat 168 as retired on preprod, preview, or mainnet until the support matrix says the network left 1.0.x.'
      : variant
        ? `Official node error codes (1.0.x) names ${code} ${variant}. midnight-docs#1509: Midnight transactions are the unsigned send_mn_transaction call, so a missing inner u8 is not a nonce or era failure.`
        : 'Code is not in this lab subset of the official 1.0.x table. Look it up on the node error codes page. This helper does not query a node.',
    credit: CREDIT,
  };
}

/**
 * Wallet SDK submit hides Custom error: N from err.message.
 * midnight-js contract calls put the chain in err.message (servicedesk runbook notes cited by midnight-docs#1509).
 * @param {{ message?: string, stack?: string } | string} error
 * @param {string} [stringForm]
 */
export function classifySubmitPrint(error, stringForm) {
  const message = typeof error === 'string' ? error : error?.message ?? '';
  const printed = stringForm ?? (typeof error === 'string' ? error : String(error));
  const inMessage = /Custom error:\s*\d+/i.test(message);
  const inString = /Custom error:\s*\d+/i.test(printed);
  const signAndSend = /signAndSend\(/.test(message) || /signAndSend\(/.test(printed);
  let classification = 'no-custom-error';
  if (signAndSend) classification = 'signed-extrinsic-sample';
  else if (inMessage) classification = 'midnight-js-message-has-code';
  else if (inString) classification = 'wallet-message-hides-code';
  return {
    upstream: UPSTREAM_ISSUE,
    classification,
    appliesSignedExtrinsicCauses: false,
    hint: classification === 'wallet-message-hides-code'
      ? 'midnight-docs#1509 and servicedesk#225: wallet submitTransaction puts Custom error: N in String(err), not in err.message. JSON.stringify drops it. Do not use api.tx.someCall().signAndSend. This lab does not submit.'
      : classification === 'midnight-js-message-has-code'
        ? 'midnight-js contract calls put Custom error: N in err.message. Still log String(err). This lab does not submit.'
        : classification === 'signed-extrinsic-sample'
          ? 'midnight-docs#1509: the official decode-1010 JavaScript sample still calls signAndSend. Midnight DApps submit with the wallet SDK. Bad signature, stale era, and wrong nonce do not apply to send_mn_transaction.'
          : 'No Custom error: N in message or String(err). A code-less TransactionInvalidError is the other case in midnight-docs#1509.',
    credit: CREDIT,
  };
}

export const nodeLineCredit = CREDIT;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const fee = classifyNodeLine1010(168);
  const print = classifySubmitPrint(
    { message: 'Transaction submission error' },
    'SubmissionError: Transaction submission error: 1010: Invalid Transaction: Custom error: 196',
  );
  if (fee.retired !== false || fee.variant !== 'FeeCalculation' || print.classification !== 'wallet-message-hides-code') {
    console.error(JSON.stringify({ fee, print }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, variant: fee.variant, classification: print.classification, credit: CREDIT }, null, 2));
}
