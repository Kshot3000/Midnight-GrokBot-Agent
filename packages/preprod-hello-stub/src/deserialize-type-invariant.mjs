/**
 * Source check for contracts/hello-midnight/deserialize-type.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/compact/standard-library/exports
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkDeserializeTypeSource(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/const decoded: ShieldedSpend = deserialize<ShieldedSpend, 32>/.test(text)) {
    failures.push('decode must annotate ShieldedSpend, the deserialize type argument T');
  }
  if (/deserialize<Boolean/.test(text)) {
    failures.push('Boolean is not the event type in the official deserialize example');
  }
  if (!/seenNullifier\s*=\s*disclose\(decoded\.nullifier\)/.test(text)) {
    failures.push('ledger write must disclose the field; disclose does not retype T');
  }
  if (/disclose\s*</.test(text)) {
    failures.push('disclose is not a type constructor');
  }
  return {
    ok: failures.length === 0,
    failures,
    returnType: 'T',
    signature: 'circuit deserialize<T, #n>(x: Bytes<n>): T',
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1387',
    docs: 'https://docs.midnight.network/compact/standard-library/exports',
  };
}
