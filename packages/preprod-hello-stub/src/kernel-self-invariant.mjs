/**
 * Source check for contracts/hello-midnight/kernel-self.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/compact/data-types/ledger-adt
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkKernelSelfSource(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/kernel\.self\(\)\.bytes/.test(text)) {
    failures.push('rememberSelf must read kernel.self().bytes (ContractAddress field)');
  }
  if (/kernel\.bytes\s*\(/.test(text)) {
    failures.push('kernel.bytes() is not a documented Kernel operation');
  }
  if (!/selfBytes\s*=\s*disclose\(\s*kernel\.self\(\)\.bytes\s*\)/.test(text)) {
    failures.push('ledger write of contract bytes must go through disclose(kernel.self().bytes)');
  }
  if (!/items\.insert\(\s*disclose\(/.test(text)) {
    failures.push('MerkleTree.insert must take one disclosed leaf');
  }
  if (/items\.insert\(\s*[^)]*,/.test(text)) {
    failures.push('MerkleTree.insert is one leaf; a second argument is not the documented insert');
  }
  if (/constructor\s*\([^)]*\)\s*\{[^}]*emit\s*\(/.test(text)) {
    failures.push('emit in a constructor is a documented static error');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1387',
  };
}
