/**
 * Source check for contracts/hello-midnight/caller-auth.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkCallerAuthSource(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (/ownPublicKey\s*\(/.test(text)) {
    failures.push('ownPublicKey() is present; docs forbid it for caller verification');
  }
  if (!/assert\s*\(\s*owner\s*==\s*pad\(32,\s*""\)/.test(text)) {
    failures.push('claimOwnership must assert the owner slot is empty before the first write');
  }
  if (!/owner\s*=\s*disclose\(/.test(text)) {
    failures.push('the owner ledger write must go through disclose()');
  }
  if (!/assert\s*\(\s*derivePublicKey\(secretKey\(\)\)\s*==\s*owner/.test(text)) {
    failures.push('withdraw must re-derive the identity and assert it matches owner');
  }
  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/902',
  };
}
