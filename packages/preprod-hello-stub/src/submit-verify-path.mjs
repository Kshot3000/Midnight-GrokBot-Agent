/**
 * Flag the official 1010 how-to verify sample when it uses author_submitExtrinsic
 * or polkadot.js signAndSend instead of the DApp Connector submit path.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Official how-to: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Official submit: https://docs.midnight.network/api-reference/dapp-connector
 * Official print path: https://docs.midnight.network/nodes/error-codes
 * Does not submit a transaction and does not fix the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const CONNECTOR = 'https://docs.midnight.network/api-reference/dapp-connector';
export const ERROR_CODES = 'https://docs.midnight.network/nodes/error-codes';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} input snippet from a how-to or a builder log
 */
export function classifySubmitVerifyPath(input) {
  const text = String(input ?? '');
  const usesAuthorSubmit = /author_submitExtrinsic/.test(text);
  const usesSignAndSend = /signAndSend/.test(text);
  const usesConnectorSubmit = /submitTransaction/.test(text);
  const usesStringPrint = /String\(\s*err(?:or)?\s*\)/.test(text);

  if (usesAuthorSubmit) {
    return {
      kind: 'docs-gap-author-submit-extrinsic',
      usesAuthorSubmit: true,
      usesSignAndSend,
      usesConnectorSubmit,
      title: 'How-to verify sample posts author_submitExtrinsic',
      hint: 'midnight-docs#1509: Midnight transactions are not verified by resubmitting a signed extrinsic with author_submitExtrinsic. The official DApp Connector 4.0.1 path is connected.submitTransaction. This classifier does not call RPC and does not fix the public node.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      connector: CONNECTOR,
    };
  }
  if (usesSignAndSend && !usesConnectorSubmit) {
    return {
      kind: 'docs-gap-sign-and-send',
      usesAuthorSubmit: false,
      usesSignAndSend: true,
      usesConnectorSubmit: false,
      title: 'How-to capture sample uses polkadot.js signAndSend',
      hint: 'midnight-docs#1509: replace api.tx.someCall().signAndSend(account) with the wallet submitTransaction path, and keep String(err) so the node reason is not dropped. This classifier does not submit.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      connector: CONNECTOR,
      errorCodes: ERROR_CODES,
    };
  }
  if (usesConnectorSubmit && usesStringPrint) {
    return {
      kind: 'connector-submit-with-string-print',
      usesAuthorSubmit: false,
      usesSignAndSend: false,
      usesConnectorSubmit: true,
      title: 'DApp Connector submitTransaction with String(err)',
      hint: 'Matches the official connector submit example and the error-codes page: print String(error), because JSON.stringify drops the node text.',
      upstream: UPSTREAM,
      official: CONNECTOR,
      errorCodes: ERROR_CODES,
    };
  }
  if (usesConnectorSubmit) {
    return {
      kind: 'connector-submit-missing-string-print',
      usesAuthorSubmit: false,
      usesSignAndSend: false,
      usesConnectorSubmit: true,
      title: 'submitTransaction without String(err)',
      hint: 'Official node error codes page: FiberFailure.message is only the outer text. Log String(error) or console.error(error) in Node. JSON.stringify(error) drops the node reason.',
      upstream: UPSTREAM,
      official: ERROR_CODES,
      connector: CONNECTOR,
    };
  }
  return {
    kind: 'not-this-gap',
    usesAuthorSubmit: false,
    usesSignAndSend: false,
    usesConnectorSubmit: false,
    title: 'Not the submit-verify docs gap',
    hint: 'No author_submitExtrinsic, signAndSend, or submitTransaction in the snippet.',
    upstream: UPSTREAM,
    official: OFFICIAL,
  };
}

export function checkSubmitVerifyPath() {
  const failures = [];
  const verify = classifySubmitVerifyPath(
    '{"jsonrpc":"2.0","id":1,"method":"author_submitExtrinsic","params":["0x..."]}',
  );
  if (verify.kind !== 'docs-gap-author-submit-extrinsic') failures.push('verify method kind');
  if (!verify.usesAuthorSubmit) failures.push('verify must flag author_submitExtrinsic');

  const capture = classifySubmitVerifyPath('await api.tx.someCall().signAndSend(account);');
  if (capture.kind !== 'docs-gap-sign-and-send') failures.push('signAndSend kind');

  const good = classifySubmitVerifyPath(
    'try { await connected.submitTransaction(resultTransaction); } catch (err) { console.error(String(err)); }',
  );
  if (good.kind !== 'connector-submit-with-string-print') failures.push('connector path kind');

  const bare = classifySubmitVerifyPath('await connected.submitTransaction(tx);');
  if (bare.kind !== 'connector-submit-missing-string-print') failures.push('missing String(err)');

  const other = classifySubmitVerifyPath('compact compile hello-world.compact');
  if (other.kind !== 'not-this-gap') failures.push('unrelated snippet');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkSubmitVerifyPath();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
