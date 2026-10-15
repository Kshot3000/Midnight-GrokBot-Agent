/**
 * Source check for the official HistoricMerkleTree group-membership pattern
 * with caller binding.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/guides/security-best-practices
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkGroupMembership(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23');
  }
  if (!/export\s+ledger\s+members:\s*HistoricMerkleTree<10,\s*Bytes<32>>/.test(code)) {
    failures.push('members must be HistoricMerkleTree<10, Bytes<32>>');
  }
  if (!/export\s+ledger\s+actions:\s*Counter/.test(code)) {
    failures.push('actions must be Counter');
  }
  if (!/witness\s+secretKey\s*\(\s*\):\s*Bytes<32>/.test(code)) {
    failures.push('must declare witness secretKey(): Bytes<32>');
  }
  if (!/circuit\s+derivePublicKey\s*\(sk:\s*Bytes<32>\)/.test(code)) {
    failures.push('derivePublicKey must take sk: Bytes<32>');
  }
  if (!/persistentHash<Vector<2,\s*Bytes<32>>>/.test(code)) {
    failures.push('derivePublicKey must use persistentHash with Vector<2, Bytes<32>>');
  }
  if (!/pad\s*\(\s*32\s*,\s*"hello-midnight:member"\s*\)/.test(code)) {
    failures.push('domain separator must be the lab pad(32, "hello-midnight:member")');
  }
  if (!/export\s+circuit\s+addMember\s*\(pk:\s*Bytes<32>\)/.test(code)) {
    failures.push('addMember must take pk: Bytes<32>');
  }
  if (!/members\.insert\s*\(\s*disclose\s*\(\s*pk\s*\)\s*\)/.test(code)) {
    failures.push('addMember must disclose the pk before insert');
  }
  if (!/export\s+circuit\s+act\s*\(path:\s*MerkleTreePath<10,\s*Bytes<32>>\)/.test(code)) {
    failures.push('act must take a MerkleTreePath<10, Bytes<32>>');
  }
  if (!/members\.checkRoot\s*\(\s*disclose\s*\(\s*merkleTreePathRoot<10,\s*Bytes<32>>\s*\(\s*path\s*\)\s*\)\s*\)/.test(code)) {
    failures.push('act must checkRoot of the disclosed path root');
  }
  if (!/assert\s*\(\s*path\.leaf\s*==\s*derivePublicKey\s*\(\s*sk\s*\)\s*,\s*"path not bound to caller"\s*\)/.test(code)) {
    failures.push('act must bind path.leaf to derivePublicKey(sk)');
  }
  if (!/assert\s*\(\s*sk\s*!=\s*pad\s*\(\s*32\s*,\s*""\s*\)\s*,\s*"secret must be non-empty"\s*\)/.test(code)) {
    failures.push('act must assert the secret is non-empty');
  }
  if (!/actions\.increment\s*\(\s*1\s*\)/.test(code)) {
    failures.push('act must increment actions');
  }
  if (/ownPublicKey/.test(code)) {
    failures.push('do not use ownPublicKey for membership');
  }

  return {
    ok: failures.length === 0,
    failures,
    bindingAssert: 'path.leaf == derivePublicKey(sk)',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabGroupMembership() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/group-membership.compact'), 'utf8');
  return checkGroupMembership(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabGroupMembership();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
