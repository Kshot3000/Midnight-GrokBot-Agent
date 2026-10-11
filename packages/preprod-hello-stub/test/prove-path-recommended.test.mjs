import { describe, it, expect } from 'vitest';
import { checkProvePathRecommended, RECOMMENDED_DOCKER, PROOF_SERVER_IMAGE } from '../src/prove-path-recommended.mjs';

describe('prove-path-recommended', () => {
  it('recommends env form that is not dropped', () => {
    const result = checkProvePathRecommended();
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(RECOMMENDED_DOCKER).toContain('MIDNIGHT_PROOF_SERVER_VERBOSE=true');
    expect(RECOMMENDED_DOCKER).toContain(PROOF_SERVER_IMAGE);
    expect(RECOMMENDED_DOCKER).not.toContain('midnight-proof-server -v');
  });
});
