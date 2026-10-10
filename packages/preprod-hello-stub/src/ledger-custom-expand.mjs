/**
 * Extra official LedgerApiError u8 names for Preprod 1010 Custom error: N.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1385
 * Official: https://docs.midnight.network/nodes/error-codes
 * Copies names and fix text already on that page. Does not invent variants.
 * Does not submit a transaction and does not fix the public node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';
import { decodeMidnightRpcError, lookupLedgerCustomError } from './rpc-errors.mjs';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1385';
export const OFFICIAL = 'https://docs.midnight.network/nodes/error-codes';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function checkLedgerCustomExpand() {
  const failures = [];
  const samples = [
    [100, 'EffectsMismatch'],
    [101, 'ContractAlreadyDeployed'],
    [102, 'ContractNotPresent'],
    [104, 'Transcript'],
    [193, 'ReplayProtectionViolation'],
  ];
  for (const [code, name] of samples) {
    const row = lookupLedgerCustomError(code);
    if (!row || row.name !== name) failures.push(`${code} must be ${name}`);
    const decoded = decodeMidnightRpcError(`1010: Invalid Transaction: Custom error: ${code}`);
    if (decoded.ledgerCode !== code) failures.push(`${code} ledgerCode`);
    if (!decoded.title.includes(name)) failures.push(`${code} title must name ${name}`);
  }
  const five = decodeMidnightRpcError('Transaction submission error (code: 10999)');
  if (five.ledgerCode != null) failures.push('10999 must not be treated as a ledger u8');
  if (!/not a ledger u8/.test(five.title)) failures.push('10999 title');
  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLedgerCustomExpand();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
