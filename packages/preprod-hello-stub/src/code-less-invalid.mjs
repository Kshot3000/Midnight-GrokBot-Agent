/**
 * Classify a code-less Midnight submission rejection.
 * Does not submit a transaction. Does not fix the public Preprod node or indexer.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Related: https://github.com/midnightntwrk/servicedesk/issues/225
 * Official how-to (still lists signed-extrinsic causes): https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Official DustDoubleSpend row: https://docs.midnight.network/nodes/error-codes
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const ERROR_CODES = 'https://docs.midnight.network/nodes/error-codes';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const SIGNED_EXTRINSIC = ['bad signature', 'stale era', 'wrong nonce'];

export function decodeCodeLessRejection(input) {
  const raw = String(input ?? '');
  const custom = raw.match(/Custom error:\s*(\d+)/);
  const ledgerCode = custom ? Number(custom[1]) : null;
  const exhaust = /exhaust the block limits/i.test(raw);
  const dropped = /Transaction is invalid and was rejected by the node/.test(raw)
    || /TransactionInvalidError/.test(raw);
  const mentionsSigned = SIGNED_EXTRINSIC.some((phrase) => raw.toLowerCase().includes(phrase));

  if (ledgerCode != null) {
    return {
      kind: ledgerCode === 196 ? 'dust-double-spend' : 'ledger-u8',
      ledgerCode,
      signedExtrinsicChecksApply: false,
      hint: ledgerCode === 196
        ? 'Official node error codes name 196 DustDoubleSpend. midnight-docs#1509 saw this only after the first spend was in a block. Use one wallet instance per seed. This decoder does not fix the node.'
        : 'Look up Custom error N on the node error codes page. Do not treat it as a bad signature, stale era, or wrong nonce.',
    };
  }
  if (/1010/.test(raw) && exhaust) {
    return {
      kind: 'block-limit-no-u8',
      ledgerCode: null,
      signedExtrinsicChecksApply: false,
      hint: '1010 with no inner u8 and this sentence is the block-limit case (servicedesk#225). The how-to still lists bad signature, stale era, and wrong nonce; those are signed-extrinsic checks and do not apply to unsigned send_mn_transaction.',
    };
  }
  if (dropped) {
    return {
      kind: 'code-less-drop',
      ledgerCode: null,
      signedExtrinsicChecksApply: false,
      mentionsSignedExtrinsicText: mentionsSigned,
      hint: 'No ledger u8 reached the client. Pool validation passed and the transaction was dropped when the block was built. Reproduced cause in midnight-docs#1509: two wallet instances on one seed spending the same DUST while the first transaction was still pending. The node log may say DustDoubleSpend; the client message does not. Use one wallet instance per seed.',
    };
  }
  return {
    kind: 'unclassified',
    ledgerCode: null,
    signedExtrinsicChecksApply: false,
    hint: 'No code-less drop or bare block-limit sentence matched. Do not invent a Custom error u8.',
  };
}

export function checkCodeLessRejection() {
  const failures = [];
  const drop = decodeCodeLessRejection(
    '(FiberFailure) SubmissionError: Transaction submission error\n  [cause]: TransactionInvalidError: Transaction is invalid and was rejected by the node',
  );
  if (drop.kind !== 'code-less-drop') failures.push('code-less drop kind');
  if (drop.ledgerCode != null) failures.push('code-less drop must not invent a u8');
  if (drop.signedExtrinsicChecksApply) failures.push('signed extrinsic checks must not apply');

  const bare = decodeCodeLessRejection('1010: Invalid Transaction: Transaction would exhaust the block limits');
  if (bare.kind !== 'block-limit-no-u8') failures.push('bare exhaust kind');
  if (SIGNED_EXTRINSIC.some((phrase) => bare.hint.toLowerCase().includes(phrase) && bare.signedExtrinsicChecksApply)) {
    failures.push('exhaust must not apply signed checks');
  }

  const later = decodeCodeLessRejection('1010: Invalid Transaction: Custom error: 196');
  if (later.kind !== 'dust-double-spend' || later.ledgerCode !== 196) failures.push('196 must stay DustDoubleSpend');

  const signedDoc = decodeCodeLessRejection('bad signature, stale era, wrong nonce');
  if (signedDoc.kind !== 'unclassified') failures.push('signed-extrinsic phrases alone are not a Midnight rejection');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkCodeLessRejection();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
