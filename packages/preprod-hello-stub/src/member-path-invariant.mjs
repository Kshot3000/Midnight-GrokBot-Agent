/**
 * Source check for contracts/hello-midnight/member-path.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official pattern: https://docs.midnight.network/guides/security-best-practices
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export function checkMemberPathSource(source) {
  const text = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const failures = [];
  if (/ownPublicKey\s*\(/.test(text)) {
    failures.push('ownPublicKey() is present; docs forbid it for caller verification');
  }
  if (/kernel\.caller/.test(text)) {
    failures.push('kernel.caller is not a documented read; servicedesk#202 says it is undefined');
  }
  if (!/HistoricMerkleTree\s*<\s*10\s*,\s*Bytes\s*<\s*32\s*>\s*>/.test(text)) {
    failures.push('members must be HistoricMerkleTree<10, Bytes<32>> as in the official group procedure');
  }
  if (!/members\.insert\(\s*disclose\(/.test(text)) {
    failures.push('addMember must insert a disclosed commitment');
  }
  if (!/members\.checkRoot\(\s*disclose\(/.test(text)) {
    failures.push('act must check the disclosed path root against the tree');
  }
  if (!/path\.leaf\s*==\s*derivePublicKey\(\s*secretKey\(\)\s*\)/.test(text)) {
    failures.push('act must bind path.leaf to derivePublicKey(secretKey())');
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
