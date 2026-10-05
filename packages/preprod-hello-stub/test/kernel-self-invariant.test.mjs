import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkKernelSelfSource } from '../src/kernel-self-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(new URL('../../../contracts/hello-midnight/kernel-self.compact', import.meta.url), 'utf8');

describe('kernel.self bytes invariant', () => {
  it('reads ContractAddress.bytes and inserts one disclosed leaf', () => {
    const result = checkKernelSelfSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
  });

  it('flags kernel.bytes, a two-arg insert, and constructor emit', () => {
    const bad = [
      'pragma language_version >= 0.23;',
      'export ledger selfBytes: Bytes<32>;',
      'export ledger items: MerkleTree<10, Field>;',
      'constructor() { emit(kernel.bytes()); }',
      'export circuit rememberSelf(): [] { selfBytes = kernel.bytes(); }',
      'export circuit insertOne(a: Field, b: Field): [] { items.insert(a, b); }',
    ].join('\n');
    const result = checkKernelSelfSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/kernel\.bytes/);
    expect(result.failures.join(' ')).toMatch(/disclose/);
    expect(result.failures.join(' ')).toMatch(/one leaf/);
    expect(result.failures.join(' ')).toMatch(/constructor/);
  });
});
