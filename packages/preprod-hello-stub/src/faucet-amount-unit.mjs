/**
 * Classifies the Preprod faucet amount unit reported in servicedesk#254.
 * Does not contact any faucet and does not invent APIs.
 * Official docs currently say 1,000 tNIGHT: https://docs.midnight.network/guides/acquire-tokens
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/254
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_FAUCET_AMOUNT = 'https://github.com/midnightntwrk/servicedesk/issues/254';
export const OFFICIAL_FUNDING_DOCS = 'https://docs.midnight.network/guides/acquire-tokens';

const STAR_PER_TNIGHT = 1_000_000n;
const REPORTED_MULTIPLIER = 5n; // amount unit is 5 tNIGHT on the public route

export function classifyFaucetAmount(amount) {
  const raw = String(amount ?? '').trim();
  if (!/^\d+$/.test(raw)) {
    return {
      kind: 'invalid-amount',
      reason: 'amount must be a non-negative integer string',
      upstream: UPSTREAM_FAUCET_AMOUNT,
    };
  }
  const requested = BigInt(raw);
  const expectedTnight = requested * REPORTED_MULTIPLIER;
  const expectedStar = expectedTnight * STAR_PER_TNIGHT;
  return {
    kind: 'multiplied-unit',
    requested: raw,
    unit: '5 tNIGHT',
    expectedTnight: expectedTnight.toString(),
    expectedStar: expectedStar.toString(),
    docsSay: '1000 tNIGHT per request',
    note: 'public /drips multiplies amount by 5 tNIGHT (servicedesk#254); page confirmation matches the multiplied value',
    upstream: UPSTREAM_FAUCET_AMOUNT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = classifyFaucetAmount('1000');
  console.log(JSON.stringify(result, null, 2));
  if (result.kind !== 'multiplied-unit' || result.expectedTnight !== '5000') process.exit(1);
  console.log('self-check ok');
}
