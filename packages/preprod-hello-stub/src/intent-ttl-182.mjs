/**
 * Keep Preprod Custom error 182 on the official 1.0.x name.
 * Does not submit a transaction. Does not fix the public Preprod node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Related: https://github.com/midnightntwrk/servicedesk/issues/225
 * Related runbook PR: https://github.com/midnightntwrk/servicedesk/pull/238
 * Official 1.0.x table: https://docs.midnight.network/nodes/error-codes
 * Official how-to: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/nodes/error-codes';
export const HOWTO = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Official node 1.0.x names from the error-codes page. Not the 2.x renumber. */
export const PREPROD_1_0_CODES = Object.freeze({
  182: {
    name: 'TransactionApplicationError',
    meaning: 'Intent TTL has expired or is too far in the future',
    fix: 'Rebuild the transaction with a new TTL and submit it before the TTL passes',
  },
  186: {
    name: 'EffectsCheckFailure',
    meaning: 'Transaction effects validation failed',
    fix: 'Declared effects do not match computed effects; rebuild the transaction',
  },
  193: {
    name: 'ReplayProtectionViolation',
    meaning: 'Transaction violates replay protection (duplicate intent)',
    fix: 'This transaction or intent was already submitted',
  },
  196: {
    name: 'DustDoubleSpend',
    meaning: 'Attempt to spend the same DUST twice',
    fix: 'DUST UTXO already consumed; resync DUST wallet. One wallet instance per seed',
  },
});

/**
 * @param {unknown} input
 */
export function decodePreprodIntentTtl(input) {
  const raw = String(input ?? '');
  const custom = raw.match(/Custom error:\s*(\d+)/);
  const ledgerCode = custom ? Number(custom[1]) : null;
  const dropped = /Transaction is invalid and was rejected by the node/.test(raw)
    || /TransactionInvalidError/.test(raw);

  if (ledgerCode != null && PREPROD_1_0_CODES[ledgerCode]) {
    const row = PREPROD_1_0_CODES[ledgerCode];
    return {
      kind: ledgerCode === 182 ? 'intent-ttl-182' : 'preprod-1-0-code',
      ledgerCode,
      name: row.name,
      applies2xRenumber: false,
      hint: `Node 1.0.x error codes name ${ledgerCode} ${row.name}: ${row.meaning}. ${row.fix}. Do not remap 182 to 228-230 or 193 to 242-244; those shifts are 2.x. This decoder does not fix the public Preprod node.`,
    };
  }
  if (ledgerCode != null) {
    return {
      kind: 'other-u8',
      ledgerCode,
      name: null,
      applies2xRenumber: false,
      hint: 'A Custom error u8 was present but is not one of the 1.0.x TTL/replay/DUST rows this helper names. Look it up on the node error codes page. Do not invent a 2.x remap.',
    };
  }
  if (dropped && !/Custom error:\s*\d+/.test(raw)) {
    return {
      kind: 'code-less-drop',
      ledgerCode: null,
      name: null,
      applies2xRenumber: false,
      hint: 'midnight-docs#1509: no u8 reached the client. Do not invent Custom error 182 or 196. The reproduced pending-DUST case logged DustDoubleSpend on the node and TransactionInvalidError on the client. Use one wallet instance per seed.',
    };
  }
  return {
    kind: 'unclassified',
    ledgerCode: null,
    name: null,
    applies2xRenumber: false,
    hint: 'No 1.0.x Custom error or code-less drop matched. Do not invent a u8.',
  };
}

export function checkPreprodIntentTtl() {
  const failures = [];
  const ttl = decodePreprodIntentTtl('1010: Invalid Transaction: Custom error: 182');
  if (ttl.kind !== 'intent-ttl-182' || ttl.name !== 'TransactionApplicationError' || ttl.ledgerCode !== 182) {
    failures.push('182 must stay TransactionApplicationError');
  }
  if (ttl.applies2xRenumber || /228/.test(ttl.name || '')) failures.push('182 must not use the 2.x number');

  const replay = decodePreprodIntentTtl('Custom error: 193');
  if (replay.name !== 'ReplayProtectionViolation') failures.push('193 name');

  const dust = decodePreprodIntentTtl('Custom error: 196');
  if (dust.name !== 'DustDoubleSpend') failures.push('196 name');

  const drop = decodePreprodIntentTtl('TransactionInvalidError: Transaction is invalid and was rejected by the node');
  if (drop.kind !== 'code-less-drop' || drop.ledgerCode != null) failures.push('code-less must not invent 182');

  const other = decodePreprodIntentTtl('Custom error: 155');
  if (other.kind !== 'other-u8' || other.name != null) failures.push('unknown u8 must stay unnamed');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkPreprodIntentTtl();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
