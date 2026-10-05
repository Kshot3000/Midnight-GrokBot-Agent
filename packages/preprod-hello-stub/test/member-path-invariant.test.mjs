import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkMemberPathSource } from '../src/member-path-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(new URL('../../../contracts/hello-midnight/member-path.compact', import.meta.url), 'utf8');

describe('member-path compact invariant', () => {
  it('binds the Merkle path to a derived key and rejects ownPublicKey', () => {
    const result = checkMemberPathSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/902/);
  });

  it('flags an unbound path and a kernel.caller read', () => {
    const bad = [
      'export ledger members: HistoricMerkleTree<10, Bytes<32>>;',
      'export circuit act(path: MerkleTreePath<10, Bytes<32>>): [] {',
      '  assert(members.checkRoot(disclose(merkleTreePathRoot<10, Bytes<32>>(path))), "not a member");',
      '  assert(path.leaf == ownPublicKey(), "not caller");',
      '  assert(kernel.caller == path.leaf, "caller");',
      '}',
    ].join('\n');
    const result = checkMemberPathSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/ownPublicKey/);
    expect(result.failures.join(' ')).toMatch(/kernel\.caller/);
    expect(result.failures.join(' ')).toMatch(/path\.leaf/);
  });
});
