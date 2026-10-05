/**
 * Distinguish a bare Preprod 1010 "Transaction would exhaust the block limits"
 * from the official ledger u8 variants 154 and 232.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/225
 * Official: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Does not submit a transaction and does not fix the public node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';
import { decodeMidnightRpcError, lookupLedgerCustomError } from './rpc-errors.mjs';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/225';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function checkBlockLimitNoU8() {
  const failures = [];
  const bare = decodeMidnightRpcError(
    '1010: Invalid Transaction: Transaction would exhaust the block limits',
  );
  if (!bare.noInnerU8) failures.push('bare exhaust sentence must be noInnerU8');
  if (bare.ledgerCode != null) failures.push('bare exhaust sentence must not invent a ledger u8');
  if (!/no Custom error u8/.test(bare.title)) failures.push('bare title must say no Custom error u8');
  if (/154 BlockLimitExceededError/.test(bare.title)) failures.push('bare title must not claim code 154');

  const infra = decodeMidnightRpcError('1010: Invalid Transaction: Custom error: 154');
  if (infra.ledgerCode !== 154) failures.push('154 must stay BlockLimitExceededError');
  if (lookupLedgerCustomError(154)?.name !== 'BlockLimitExceededError') failures.push('154 name');

  const malformed = decodeMidnightRpcError('1010: Invalid Transaction: Custom error: 232');
  if (malformed.ledgerCode !== 232) failures.push('232 must stay FeeCalculation.BlockLimitExceeded');
  if (lookupLedgerCustomError(232)?.name !== 'FeeCalculation.BlockLimitExceeded') failures.push('232 name');

  const hidden = decodeMidnightRpcError('Transaction submission error');
  if (hidden.noInnerU8) failures.push('generic submit error is not the exhaust sentence');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkBlockLimitNoU8();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
