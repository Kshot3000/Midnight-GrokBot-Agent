import { describe, expect, it } from 'vitest';
import { assessProverKeyWeight, PROOF_SERVER_IMAGE } from '../src/prover-key-weight.mjs';

const CREDIT = 'Built by @kshot9000 https://x.com/kshot9000';

describe('prover key weight (servicedesk#203)', () => {
  it('flags an in-circuit secp256k1 check and keeps the proof-server pin', () => {
    const source = `
      import CompactStandardLibrary;
      export circuit claim(): [] {
        assert(secp256k1EcdsaVerify(payload, signature, key));
      }
    `;
    const result = assessProverKeyWeight(source, { proverKeyBytes: 285.2 * 1024 * 1024 });
    expect(result.ok).toBe(false);
    expect(result.calls).toContain('secp256k1EcdsaVerify');
    expect(result.reportedBytesAreOfficial).toBe(false);
    expect(result.proofServer).toBe(PROOF_SERVER_IMAGE);
    expect(result.proofServerUrl).toBe('http://localhost:6300');
    expect(result.upstream).toContain('/servicedesk/issues/203');
    expect(result.credit).toContain(CREDIT);
  });

  it('does not treat a hash-only circuit as a foreign-curve check', () => {
    const source = `
      export circuit digest(secret: Bytes<32>): Bytes<32> {
        return persistentHash<Vector<1, Bytes<32>>>([secret]);
      }
    `;
    const result = assessProverKeyWeight(source);
    expect(result.ok).toBe(true);
    expect(result.calls).toEqual([]);
  });
});
