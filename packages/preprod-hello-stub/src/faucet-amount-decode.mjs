/**
 * Decode the faucet POST /drips amount unit reported in servicedesk#254.
 * Does not call the faucet and does not submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/254
 * Official token page (no faucet API amount unit):
 *   https://docs.midnight.network/guides/acquire-tokens
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/254';
export const TOKEN_DOCS = 'https://docs.midnight.network/guides/acquire-tokens';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string|object} input
 */
export function decodeFaucetAmount(input) {
  let amount = null;
  let raw = '';
  if (typeof input === 'string') {
    raw = input;
    const match = input.match(/"amount"\s*:\s*"(\d+)"/);
    if (match) amount = Number(match[1]);
    else if (/^\d+$/.test(input.trim())) amount = Number(input.trim());
  } else if (input && typeof input === 'object' && input.amount != null) {
    amount = Number(input.amount);
    raw = JSON.stringify(input);
  }

  if (amount == null || Number.isNaN(amount)) {
    return {
      ok: false,
      classification: 'incomplete',
      title: 'faucet amount not found',
      hint: 'Pass a body with "amount": "1000" or a numeric string. This helper does not call the faucet.',
      upstream: UPSTREAM,
      docs: TOKEN_DOCS,
      credit: CREDIT,
    };
  }

  const multiplied = amount * 5;
  const isReported = amount === 1000;

  return {
    ok: true,
    classification: isReported ? 'reported-1000-becomes-5000' : 'amount-times-five',
    requested: amount,
    deliveredIfMultiplied: multiplied,
    unitNote: 'issue reports amount is in units of 5 tNIGHT',
    title: isReported
      ? 'Request for 1000 delivers 5000 tNIGHT'
      : `Requested ${amount} would deliver ${multiplied} tNIGHT if the multiplier applies`,
    hint:
      'servicedesk#254 reports POST /drips multiplies amount by 5 tNIGHT. A body of {"amount":"1000"} yields 5000 tNIGHT. This decode does not fix the public faucet, indexer, or node. Official acquire-tokens page does not document the faucet API unit.',
    upstream: UPSTREAM,
    docs: TOKEN_DOCS,
    claim: 'sample classification only — not a faucet or node fix',
    credit: CREDIT,
  };
}

export const faucetAmountCredit = CREDIT;
