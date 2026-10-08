/**
 * Classify a 1010 with no Custom error u8 without applying the signed-extrinsic
 * causes still listed on the official how-to page.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1509
 * Official: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 * Related node rejection: https://github.com/midnightntwrk/servicedesk/issues/225
 * Does not submit a transaction and does not fix the public node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1509';
export const OFFICIAL = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const NODE_REJECTION = 'https://github.com/midnightntwrk/servicedesk/issues/225';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/** Causes the official how-to still lists under "When 1010 has no inner u8". */
export const SIGNED_EXTRINSIC_CAUSES = ['bad signature', 'stale era', 'wrong nonce'];

export function classifyUnsigned1010(input) {
  const text = String(input ?? '').replace(/\s+/g, ' ').trim();
  const custom = text.match(/Custom error:\s*(\d+)/i);
  if (custom) {
    return {
      kind: 'ledger-u8',
      ledgerCode: Number(custom[1]),
      appliesSignedExtrinsicCauses: false,
      title: `Custom error: ${custom[1]} — look up the u8 on the node error tables`,
      hint: 'An inner u8 is present. Use the official error tables. Do not use the no-inner-u8 list.',
      upstream: UPSTREAM,
      official: OFFICIAL,
    };
  }
  if (/exhaust the block limits/i.test(text)) {
    return {
      kind: 'block-limit-no-u8',
      ledgerCode: null,
      appliesSignedExtrinsicCauses: false,
      title: '1010 with no Custom error u8: Transaction would exhaust the block limits',
      hint: 'midnight-docs#1509: the 1010 without a number that builders hit is this sentence, from a deploy too big for one block (servicedesk#225). Do not diagnose it as a bad signature, a stale era, or a wrong nonce. Those checks are on signed extrinsics; Midnight transactions are submitted as the unsigned send_mn_transaction call. This classifier does not fix the public node.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      nodeRejection: NODE_REJECTION,
    };
  }
  const matched = SIGNED_EXTRINSIC_CAUSES.filter((cause) => text.toLowerCase().includes(cause));
  if (/1010/.test(text) && matched.length) {
    return {
      kind: 'docs-gap-signed-cause',
      ledgerCode: null,
      appliesSignedExtrinsicCauses: false,
      matched,
      title: 'Official no-inner-u8 list does not apply to a Midnight transaction',
      hint: `The how-to page lists ${matched.join(', ')} when 1010 has no Custom error: N. midnight-docs#1509: those are signed-extrinsic checks. Midnight transactions have no signer, nonce, or era to get wrong. Do not rebuild for a stale era or re-query an account nonce. This lab note does not change the public docs page.`,
      upstream: UPSTREAM,
      official: OFFICIAL,
    };
  }
  if (/signAndSend/.test(text)) {
    return {
      kind: 'docs-gap-sign-and-send',
      ledgerCode: null,
      appliesSignedExtrinsicCauses: false,
      title: 'How-to JavaScript sample uses polkadot.js signAndSend',
      hint: 'midnight-docs#1509: Midnight DApps do not submit with api.tx.someCall().signAndSend(account). Log String(err) from the wallet submit path instead. This classifier does not call a wallet.',
      upstream: UPSTREAM,
      official: OFFICIAL,
    };
  }
  return {
    kind: 'not-this-gap',
    ledgerCode: null,
    appliesSignedExtrinsicCauses: false,
    title: 'Not the unsigned-1010 docs gap',
    hint: 'No Custom error u8, exhaust sentence, signed-cause wording, or signAndSend sample.',
    upstream: UPSTREAM,
    official: OFFICIAL,
  };
}

export function checkUnsigned1010Causes() {
  const failures = [];
  const exhaust = classifyUnsigned1010('1010: Invalid Transaction: Transaction would exhaust the block limits');
  if (exhaust.kind !== 'block-limit-no-u8') failures.push('exhaust sentence kind');
  if (exhaust.ledgerCode != null) failures.push('exhaust must not invent a u8');
  if (exhaust.appliesSignedExtrinsicCauses) failures.push('exhaust must not apply signed causes');

  const signed = classifyUnsigned1010('1010 Invalid Transaction: bad signature, stale era, or wrong nonce');
  if (signed.kind !== 'docs-gap-signed-cause') failures.push('signed wording kind');
  if (signed.appliesSignedExtrinsicCauses) failures.push('signed wording must be rejected for Midnight tx');
  if (!signed.matched || signed.matched.length !== 3) failures.push('must name all three official causes');

  const ledger = classifyUnsigned1010('RpcError: 1010: Invalid Transaction: Custom error: 155');
  if (ledger.kind !== 'ledger-u8' || ledger.ledgerCode !== 155) failures.push('155 must stay a ledger u8');

  const sample = classifyUnsigned1010('await api.tx.someCall().signAndSend(account)');
  if (sample.kind !== 'docs-gap-sign-and-send') failures.push('signAndSend sample');

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkUnsigned1010Causes();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
