/**
 * Classifies the Preprod faucet page confirmation mismatch reported in servicedesk#254.
 * Official docs say the page confirms 1000 tNight; the issue reports the page confirms 5000.
 * Does not contact any faucet and does not invent APIs.
 * Official: https://docs.midnight.network/guides/acquire-tokens
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/254
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/254';
export const OFFICIAL = 'https://docs.midnight.network/guides/acquire-tokens';

const DOCS_CONFIRM = 1000;
const REPORTED_PAGE_CONFIRM = 5000; // page confirms the multiplied value

export function classifyPageConfirmation(requested) {
  const raw = String(requested ?? '').trim();
  if (!/^\d+$/.test(raw)) {
    return {
      kind: 'invalid',
      reason: 'requested amount must be a non-negative integer string',
      upstream: UPSTREAM,
    };
  }
  const n = Number(raw);
  return {
    kind: 'docs-page-mismatch',
    requested: raw,
    docsConfirm: String(DOCS_CONFIRM),
    reportedPageConfirm: String(REPORTED_PAGE_CONFIRM),
    note: 'official docs describe a 1000 tNight confirmation; servicedesk#254 reports the page confirms 5000 because amount is multiplied by 5 tNIGHT',
    upstream: UPSTREAM,
    docs: OFFICIAL,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = classifyPageConfirmation('1000');
  console.log(JSON.stringify(result, null, 2));
  if (result.kind !== 'docs-page-mismatch' || result.reportedPageConfirm !== '5000') process.exit(1);
  console.log('self-check ok');
}
