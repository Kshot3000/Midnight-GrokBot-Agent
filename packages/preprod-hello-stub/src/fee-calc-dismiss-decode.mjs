/**
 * Preprod error decoding for FeeCalculation / OutsideTimeToDismiss.
 *
 * Official: https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors
 *   168 FeeCalculation / 155 FeeCalculationError: fee calculation failed.
 *   Validating and applying the guaranteed part would take longer than the
 *   ledger allows for a transaction of that size.
 * Official table: https://docs.midnight.network/nodes/error-codes
 *   168 FeeCalculation — Transaction size or timing parameters are invalid.
 * Official ledger error: https://docs.midnight.network/api-reference/error-reference/ledger-errors
 *   FeeCalculationError.OutsideTimeToDismiss — The transaction exceeds the
 *   maximum allowed time-to-dismiss for its byte size.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/117
 *   Reports that receiveUnshielded / sendUnshielded calls are rejected as
 *   1010 Custom error: 231 with Malformed(FeeCalculation(OutsideTimeToDismiss)),
 *   while a larger pure-state call is accepted. Public networks (node 1.0.400)
 *   use the 1.0.x table (168), not 231. Fix tracked in midnight-ledger#761.
 *   This lab does not claim the public node or ledger is fixed.
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/117';
export const OFFICIAL_DECODE = 'https://docs.midnight.network/how-to/decode-1010-transaction-rejection-errors';
export const OFFICIAL_CODES = 'https://docs.midnight.network/nodes/error-codes';

export const PUBLIC_NETWORK_FEE_CODE = 168;
export const REPORTED_STAGENET_CODE = 231;

/**
 * Classify a submission error string for the known dismiss-time case.
 * Returns a plain object. Does not submit, prove, or talk to any network.
 */
export function classifyDismissError(text) {
  const s = String(text || '');
  const m = s.match(/Custom error:\s*(\d+)/);
  const code = m ? Number(m[1]) : null;
  const hasOutside = /OutsideTimeToDismiss/i.test(s);
  const isFee = code === PUBLIC_NETWORK_FEE_CODE || code === 155 || hasOutside;
  const isReported = code === REPORTED_STAGENET_CODE;

  return {
    code,
    isFeeCalculation: isFee,
    isReported231: isReported,
    variant: hasOutside ? 'OutsideTimeToDismiss' : (isFee ? 'FeeCalculation' : null),
    note: isReported
      ? 'Reported on 2.x / stagenet; public 1.0.x networks use 168 for FeeCalculation.'
      : isFee
        ? 'Official 1.0.x FeeCalculation. Split work or wait for ledger#761 fix for unshielded ops.'
        : 'Not the known dismiss-time case.',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = process.argv[2] || '1010: Invalid Transaction: Custom error: 168 Malformed(FeeCalculation(OutsideTimeToDismiss))';
  console.log(JSON.stringify(classifyDismissError(sample), null, 2));
}
