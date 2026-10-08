/**
 * Decode a DApp Connector API 4.0.1 submit error without calling a wallet.
 * Does not submit a transaction. Does not fix the public Preprod node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Related: https://github.com/midnightntwrk/servicedesk/issues/225
 * Official connector errors: https://docs.midnight.network/api-reference/error-reference/dapp-connector-errors
 * Official node note: https://docs.midnight.network/nodes/error-codes
 * Official how-to (still shows signAndSend): https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const RELATED = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const OFFICIAL = 'https://docs.midnight.network/api-reference/error-reference/dapp-connector-errors';
export const ERROR_CODES = 'https://docs.midnight.network/nodes/error-codes';
export const CONNECTOR_PIN = '4.0.1';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Codes documented for @midnight-ntwrk/dapp-connector-api v4.0.1. */
export const CONNECTOR_CODES = Object.freeze([
  'Disconnected',
  'InternalError',
  'InvalidRequest',
  'PermissionRejected',
  'Rejected',
]);

function customError(text) {
  const match = String(text ?? '').match(/Custom error:\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

/**
 * @param {{ type?: string, code?: string, reason?: string, message?: string }} input
 */
export function decodeConnectorReason(input) {
  const type = input?.type;
  const code = input?.code;
  const reason = String(input?.reason ?? input?.message ?? '');
  const ledgerCode = customError(reason);
  const exhaust = /exhaust the block limits/i.test(reason);
  const knownCode = CONNECTOR_CODES.includes(code);

  if (type !== 'DAppConnectorAPIError' || !knownCode) {
    return {
      kind: 'not-connector-api-error',
      connectorCode: knownCode ? code : null,
      ledgerCode,
      nodeReasonPresent: ledgerCode != null || exhaust,
      hint: 'Official APIError is type DAppConnectorAPIError plus one of Disconnected, InternalError, InvalidRequest, PermissionRejected, Rejected, and a reason string. Do not invent another connector code.',
    };
  }

  if (code === 'Rejected' || code === 'PermissionRejected') {
    return {
      kind: 'user-declined',
      connectorCode: code,
      ledgerCode: null,
      nodeReasonPresent: false,
      hint: code === 'Rejected'
        ? 'Official connector docs: Rejected means the user declined this request. Do not auto-retry. This is not a node 1010.'
        : 'Official connector docs: PermissionRejected is a session preference. Ask the user to unblock the DApp. This is not a node 1010.',
    };
  }

  if (ledgerCode != null) {
    return {
      kind: 'reason-has-ledger-u8',
      connectorCode: code,
      ledgerCode,
      nodeReasonPresent: true,
      hint: ledgerCode === 196
        ? 'reason included Custom error: 196. Official node error codes name 196 DustDoubleSpend and say not to run more than one wallet instance from the same seed. This decoder does not fix the node.'
        : 'reason included Custom error: N. Look up N on the node error codes page. The connector API does not require the wallet to include that text.',
    };
  }

  if (exhaust) {
    return {
      kind: 'reason-block-limit',
      connectorCode: code,
      ledgerCode: null,
      nodeReasonPresent: true,
      hint: 'reason has the block-limit sentence and no Custom error u8. midnight-docs#1509 and servicedesk#225: do not map that sentence to bad signature, stale era, or wrong nonce. This decoder does not fix the node.',
    };
  }

  return {
    kind: 'connector-without-node-text',
    connectorCode: code,
    ledgerCode: null,
    nodeReasonPresent: false,
    hint: 'Official node error codes: the DApp Connector API does not require the wallet to include the node response in reason. A missing Custom error: N is not a signed-extrinsic failure. Do not invent a u8.',
  };
}

export function checkConnectorReason() {
  const failures = [];
  const missing = decodeConnectorReason({
    type: 'DAppConnectorAPIError',
    code: 'InvalidRequest',
    reason: 'malformed transaction',
  });
  if (missing.kind !== 'connector-without-node-text' || missing.ledgerCode != null) {
    failures.push('missing node text');
  }

  const dust = decodeConnectorReason({
    type: 'DAppConnectorAPIError',
    code: 'InvalidRequest',
    reason: '1010: Invalid Transaction: Custom error: 196',
  });
  if (dust.kind !== 'reason-has-ledger-u8' || dust.ledgerCode !== 196) failures.push('196 in reason');

  const limit = decodeConnectorReason({
    type: 'DAppConnectorAPIError',
    code: 'InternalError',
    reason: 'Transaction would exhaust the block limits',
  });
  if (limit.kind !== 'reason-block-limit' || limit.ledgerCode != null) failures.push('block limit reason');

  const declined = decodeConnectorReason({
    type: 'DAppConnectorAPIError',
    code: 'Rejected',
    reason: 'user cancelled',
  });
  if (declined.kind !== 'user-declined') failures.push('Rejected');

  const foreign = decodeConnectorReason({ type: 'SubmissionError', code: 'Rejected', reason: 'no' });
  if (foreign.kind !== 'not-connector-api-error') failures.push('non-connector type');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkConnectorReason();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, pin: CONNECTOR_PIN, credit: CREDIT }, null, 2));
}
