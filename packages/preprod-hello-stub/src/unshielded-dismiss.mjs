/**
 * Decode the unshielded-call rejection reported in servicedesk#117.
 * Official error table lists 168 FeeCalculation and 155 FeeCalculationError.
 * It does not list 231. The issue reports Custom error: 231 together with
 * Malformed(FeeCalculation(OutsideTimeToDismiss)) and a 15.706ms vs 15.000ms
 * dismiss-time sentence. This module only classifies text. It does not submit
 * and does not claim the public node or ledger is fixed.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/117
 * Official: https://docs.midnight.network/nodes/error-codes
 * Official call shape: https://docs.midnight.network/examples/contracts/private-guest-list
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/117';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/nodes/error-codes';
export const OFFICIAL_SHAPE = 'https://docs.midnight.network/examples/contracts/private-guest-list';

export const OFFICIAL_FEE_CODES = Object.freeze({
  168: 'FeeCalculation',
  155: 'FeeCalculationError',
});

/** Reported by servicedesk#117. Not present in the published error table. */
export const REPORTED_CODE = 231;
export const REPORTED_VARIANT = 'Malformed(FeeCalculation(OutsideTimeToDismiss))';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  return [error.message, error.data, error.cause?.message].filter(Boolean).join(' ');
}

/**
 * @param {unknown} error
 */
export function decodeUnshieldedDismiss(error) {
  const blob = textOf(error);
  const custom = blob.match(/Custom error:\s*(\d+)/);
  const code = custom ? Number(custom[1]) : null;
  const dismissSentence = /exceeded the maximum time to dismiss/i.test(blob)
    || /OutsideTimeToDismiss/.test(blob);
  const officialName = code != null && OFFICIAL_FEE_CODES[code] ? OFFICIAL_FEE_CODES[code] : null;
  const reported = code === REPORTED_CODE || dismissSentence;
  return {
    ok: reported || officialName != null,
    code,
    officialName,
    publishedTableHas231: false,
    reportedVariant: reported ? REPORTED_VARIANT : null,
    classification: reported
      ? 'reported-outside-time-to-dismiss'
      : officialName
        ? 'official-fee-calculation'
        : 'unclassified',
    title: reported
      ? 'Unshielded call text matches servicedesk#117 dismiss-time rejection'
      : officialName
        ? `Official table name for ${code} is ${officialName}`
        : 'Text is not the reported dismiss-time rejection',
    hint: reported
      ? 'The issue says a ~7 KB receiveUnshielded call was rejected while a larger pure-state call was accepted. That is a ledger cost-model report, not a size check. This lab does not submit a fix.'
      : 'Look up Custom error: N on the official node error-codes page. 231 is not in that table.',
    upstream: UPSTREAM,
    official: OFFICIAL_ERRORS,
    credit: CREDIT,
  };
}

export function checkUnshieldedContractSource(source) {
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23;/.test(source)) {
    failures.push('pragma must stay in the pinned 0.22..0.23 window');
  }
  if (!/receiveUnshielded\(disclose\(color\),\s*disclose\(amount\)\)/.test(source)) {
    failures.push('receiveUnshielded arguments must be disclosed');
  }
  if (/sendUnshielded\(/.test(source) && !/disclose\(/.test(source)) {
    failures.push('unshielded send must disclose its public arguments');
  }
  return { ok: failures.length === 0, failures };
}

export function checkUnshieldedDismissLab() {
  const failures = [];
  const reported = decodeUnshieldedDismiss(
    '1010: Invalid Transaction: Custom error: 231 Malformed(FeeCalculation(OutsideTimeToDismiss)) exceeded the maximum time to dismiss for transaction size; this transaction would take 15.706ms to dismiss, but given its size of 7090 bytes, it may take at most 15.000ms',
  );
  if (reported.classification !== 'reported-outside-time-to-dismiss') failures.push('231 sentence');
  if (reported.publishedTableHas231 !== false) failures.push('must not invent a published 231 row');
  if (reported.officialName != null) failures.push('231 is not an official table name');

  const official = decodeUnshieldedDismiss('1010: Invalid Transaction: Custom error: 168');
  if (official.officialName !== 'FeeCalculation') failures.push('168 must stay FeeCalculation');

  const other = decodeUnshieldedDismiss('1010: Invalid Transaction: Custom error: 154');
  if (other.ok) failures.push('154 is not this decoder');

  const here = dirname(fileURLToPath(import.meta.url));
  const contractPath = join(here, '../../../contracts/unshielded-dismiss/unshielded.compact');
  const source = readFileSync(contractPath, 'utf8');
  const contract = checkUnshieldedContractSource(source);
  failures.push(...contract.failures);

  return { ok: failures.length === 0, failures, upstream: UPSTREAM, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkUnshieldedDismissLab();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
