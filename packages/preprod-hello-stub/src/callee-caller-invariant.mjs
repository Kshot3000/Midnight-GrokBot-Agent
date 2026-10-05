/**
 * Source check for contracts/hello-midnight/explicit-callee.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/202
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkCalleeCallerSource(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (/kernel\s*\.\s*caller\s*\(/.test(text)) {
    failures.push('kernel.caller() is a Compact 0.35 / language 0.27 API; public pin is compact update 0.31');
  }
  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/assert\s*\(\s*allowedCaller\s*==\s*pad\(32,\s*""\)/.test(text)) {
    failures.push('registerCaller must assert the slot is empty before the first write');
  }
  if (!/allowedCaller\s*=\s*disclose\(/.test(text)) {
    failures.push('the allowedCaller ledger write must go through disclose()');
  }
  if (!/export circuit acceptFromCaller\s*\(\s*presented:\s*Bytes<32>\s*\)/.test(text)) {
    failures.push('acceptFromCaller must take an explicit Bytes<32> caller commitment');
  }
  if (!/assert\s*\(\s*presented\s*==\s*allowedCaller/.test(text)) {
    failures.push('acceptFromCaller must assert the presented commitment matches the ledger');
  }
  if (!/assert\s*\(\s*callerCommitment\(callerSecret\(\)\)\s*==\s*allowedCaller/.test(text)) {
    failures.push('acceptFromCaller must re-derive the witness commitment');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: 'https://github.com/midnightntwrk/servicedesk/issues/202',
    publicCompiler: 'compact update 0.31',
  };
}
