/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkMerkleInsertHashSource } from '../src/merkle-insert-hash-invariant.mjs';

test('lab merkle-insert-hash.compact uses documented insert and insertHash', () => {
  const result = checkMerkleInsertHashSource();
  assert.equal(result.ok, true, result.reasons.join('; '));
  assert.equal(result.upstream.includes('midnight-docs/issues/63'), true);
});

test('rejects a Compact source that calls the TypeScript-only path finder', () => {
  const bad = `
    pragma language_version 0.23;
    export ledger leaves: MerkleTree<10, Bytes<32>>;
    export circuit bad(): [] {
      leaves.insert(disclose(persistentHash(pad(32, "x"))));
      findPathForLeaf(pad(32, "x"));
    }
  `;
  const result = checkMerkleInsertHashSource(bad);
  assert.equal(result.ok, false);
  assert.equal(result.reasons.some((r) => r.includes('findPathForLeaf')), true);
});
