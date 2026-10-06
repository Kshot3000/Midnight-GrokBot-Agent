/**
 * Source check for contracts/hello-midnight/transient-hash-guard.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkTransientHashGuard(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must be the public-network bound >= 0.22 && <= 0.23');
  }
  if (/deserialize\s*<\s*Boolean/.test(text)) {
    failures.push('deserialize<Boolean is not a documented event instantiation');
  }
  if (!/deserialize\s*<\s*ShieldedSpend\s*,\s*32\s*>/.test(text)) {
    failures.push('round-trip must use deserialize<ShieldedSpend, 32> (documented size 32)');
  }
  if (!/note\s*=\s*disclose\(\s*persistentHash\s*<\s*Bytes\s*<\s*32\s*>\s*>/.test(text)) {
    failures.push('ledger note must be disclose(persistentHash<Bytes<32>>(...))');
  }
  const ledgerWrites = text.split('\n').filter((line) => /^\s*note\s*=/.test(line));
  if (ledgerWrites.some((line) => /transientHash/.test(line))) {
    failures.push('transientHash must not be written to ledger state');
  }
  if (!/transientHash\s*<\s*Bytes\s*<\s*32\s*>\s*>/.test(text)) {
    failures.push('a transientHash consistency check should stay off the ledger write');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1387',
  };
}
