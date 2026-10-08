/**
 * Classify which print of a wallet or midnight-js submit rejection still shows the node reason.
 * Does not submit a transaction. Does not fix the public Preprod node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Related: https://github.com/midnightntwrk/servicedesk/issues/225
 * Runbook that recorded the print difference: https://github.com/midnightntwrk/servicedesk/issues/238
 * Official how-to: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Official submission errors: https://docs.midnight.network/nodes/error-codes
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const RELATED = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const RUNBOOK = 'https://github.com/midnightntwrk/servicedesk/issues/238';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const ERROR_CODES = 'https://docs.midnight.network/nodes/error-codes';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function hasNodeReason(text) {
  return /Custom error:\s*\d+/i.test(text)
    || /exhaust the block limits/i.test(text)
    || /Transaction is invalid and was rejected by the node/.test(text);
}

/**
 * @param {{ message?: string, printed?: string, json?: string, stack?: string, cause?: unknown }} input
 * message: err.message. printed: String(err). json: JSON.stringify(err).
 */
export function classifySubmitPrint(input) {
  const message = String(input?.message ?? '');
  const printed = String(input?.printed ?? '');
  const json = String(input?.json ?? '');
  const stack = String(input?.stack ?? '');
  const causeMissing = input?.cause == null;
  const messageHasReason = hasNodeReason(message);
  const printedHasReason = hasNodeReason(printed);
  const jsonHasReason = hasNodeReason(json);
  const stackHasReason = hasNodeReason(stack);

  if (/signAndSend/.test(printed) || /signAndSend/.test(message)) {
    return {
      kind: 'wrong-client-sample',
      messageHasReason,
      printedHasReason,
      jsonHasReason,
      hint: 'The official how-to still shows api.tx.someCall().signAndSend(account). midnight-docs#1509 says Midnight DApps do not submit that way. Log String(err) from the wallet submit path. This classifier does not call a wallet.',
    };
  }
  if (messageHasReason) {
    return {
      kind: 'midnight-js-message-has-chain',
      messageHasReason: true,
      printedHasReason,
      jsonHasReason,
      hint: 'servicedesk#238: midnight-js contract calls put the node chain in err.message. Keep reading message. A WalletFacade.submitTransaction rejection does not do this. This classifier does not fix the public node.',
    };
  }
  if (message === 'Transaction submission error' && printedHasReason && !jsonHasReason && causeMissing) {
    return {
      kind: 'wallet-string-only',
      messageHasReason: false,
      printedHasReason: true,
      jsonHasReason: false,
      causeMissing: true,
      stackHasReason,
      hint: 'Official error codes name SubmissionError: Transaction submission error. servicedesk#225 and #238: WalletFacade.submitTransaction leaves the node reason out of err.message, err.stack, and JSON.stringify(err), and err.cause is undefined. String(err) and console.error(err) still carry it. Do not stop at the message. This classifier does not fix the public node.',
    };
  }
  if ((json === '{}' || json === '') && printedHasReason) {
    return {
      kind: 'stringify-dropped-code',
      messageHasReason,
      printedHasReason: true,
      jsonHasReason: false,
      hint: 'The official how-to says JSON.stringify(err) prints {} for this error and loses the code. Use String(err). This classifier does not submit a transaction.',
    };
  }
  return {
    kind: 'unclassified',
    messageHasReason,
    printedHasReason,
    jsonHasReason,
    hint: 'No wallet print-path pattern matched. Do not invent a Custom error u8.',
  };
}

export function checkSubmitPrintPath() {
  const failures = [];
  const wallet = classifySubmitPrint({
    message: 'Transaction submission error',
    printed: '(FiberFailure) SubmissionError: Transaction submission error\nRpcError: 1010: Invalid Transaction: Custom error: 182',
    json: '{}',
    stack: 'SubmissionError: Transaction submission error',
    cause: undefined,
  });
  if (wallet.kind !== 'wallet-string-only') failures.push('wallet string-only kind');
  if (wallet.messageHasReason) failures.push('wallet message must not be treated as carrying the code');

  const jsCall = classifySubmitPrint({
    message: 'Transaction submission error: 1010: Invalid Transaction: Custom error: 182',
    printed: 'Error: Transaction submission error: 1010: Invalid Transaction: Custom error: 182',
    json: '{}',
  });
  if (jsCall.kind !== 'midnight-js-message-has-chain') failures.push('midnight-js message chain');

  const dropped = classifySubmitPrint({
    message: 'Transaction submission error',
    printed: 'SubmissionError: Transaction submission error\nTransactionInvalidError: Transaction is invalid and was rejected by the node',
    json: '{}',
    cause: undefined,
  });
  if (dropped.kind !== 'wallet-string-only') failures.push('code-less drop still visible on String(err)');

  const sample = classifySubmitPrint({
    message: '',
    printed: 'await api.tx.someCall().signAndSend(account)',
    json: '{}',
  });
  if (sample.kind !== 'wrong-client-sample') failures.push('signAndSend sample');

  const bare = classifySubmitPrint({ message: 'network down', printed: 'network down', json: '{"message":"network down"}' });
  if (bare.kind !== 'unclassified') failures.push('unrelated text must stay unclassified');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkSubmitPrintPath();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
