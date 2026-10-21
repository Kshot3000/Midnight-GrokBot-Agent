import { describe, it, expect } from 'vitest';
import { classifyPersistentHash } from '../src/persistent-hash-invariant.mjs';

describe('persistentHash state derivation', () => {
  it('accepts a ledger write that uses persistentHash and assert', () => {
    const src = `
      export ledger noteId: Bytes<32>;
      export circuit store(): [] {
        const id = persistentHash<Vector<1, Bytes<32>>>([default<Bytes<32>>]);
        assert(id != default<Bytes<32>>, "zero");
        noteId = id;
      }
    `;
    const r = classifyPersistentHash(src);
    expect(r.ok).toBe(true);
    expect(r.kind).toBe('persistent-hash-state-derivation');
    expect(r.upstream).toContain('203');
  });

  it('rejects source that only hashes', () => {
    const r = classifyPersistentHash('const x = persistentHash<Bytes<32>>(b);');
    expect(r.ok).toBe(false);
  });
});
