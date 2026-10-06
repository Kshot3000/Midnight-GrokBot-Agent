/**
 * Source check for contracts/hello-midnight/merkle-insert.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/compact/reference/ledger-adt
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/63
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_MERKLE_INSERT = 'https://github.com/midnightntwrk/midnight-docs/issues/63';
export const OFFICIAL_MERKLE_INSERT = 'https://docs.midnight.network/compact/reference/ledger-adt';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Flag a Compact source that blurs MerkleTree.insert and insertHash.
 * insert takes one value_type leaf. insertHash takes one Bytes<32>.
 * Neither method is documented as inserting more than one leaf.
 */
export function checkMerkleInsertSource(source) {
  const text = stripComments(source);
  const failures = [];

  if (!/pragma language_version >= 0\.23/.test(text)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/MerkleTree<\s*10\s*,\s*Field\s*>/.test(text)) {
    failures.push('items must be MerkleTree<10, Field> (depth in the documented 2..32 range)');
  }
  if (!/items\.insert\(\s*disclose\(/.test(text)) {
    failures.push('insertLeaf must call items.insert(disclose(item)) for one leaf');
  }
  if (!/items\.insertHash\(\s*disclose\(/.test(text)) {
    failures.push('insertPrehashed must call items.insertHash(disclose(hash)) for one Bytes<32>');
  }
  if (/items\.insert\(\s*[^)]*,/.test(text) || /items\.insertHash\(\s*[^)]*,/.test(text)) {
    failures.push('insert and insertHash each take one argument; a second leaf is not documented');
  }
  if (!/assert\(\s*!items\.isFull\(\)/.test(text)) {
    failures.push('direct insert must assert !items.isFull() first');
  }
  if (/items\.insert\(\s*hash\b/.test(text)) {
    failures.push('a prehashed Bytes<32> belongs on insertHash, not insert');
  }

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM_MERKLE_INSERT,
    official: OFFICIAL_MERKLE_INSERT,
    credit: CREDIT,
  };
}
