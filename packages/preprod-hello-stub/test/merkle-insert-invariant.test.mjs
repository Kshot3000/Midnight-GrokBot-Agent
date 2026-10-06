import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkMerkleInsertSource } from '../src/merkle-insert-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/merkle-insert.compact', import.meta.url),
  'utf8',
);

describe('MerkleTree insert vs insertHash', () => {
  it('uses one disclosed leaf on insert and one Bytes<32> on insertHash', () => {
    const result = checkMerkleInsertSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/63/);
  });

  it('flags a two-leaf insert and a hash passed to insert', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'export ledger items: MerkleTree<10, Field>;',
      'export circuit insertLeaf(a: Field, b: Field): [] { items.insert(a, b); }',
      'export circuit insertPrehashed(hash: Bytes<32>): [] { items.insert(hash); }',
    ].join('\n');
    const result = checkMerkleInsertSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/one argument/);
    expect(result.failures.join(' ')).toMatch(/insertHash/);
    expect(result.failures.join(' ')).toMatch(/isFull/);
  });
});
