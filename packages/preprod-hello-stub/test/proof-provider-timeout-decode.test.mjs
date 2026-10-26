import { describe, it, expect } from 'vitest';
import { decodeProofProviderTimeout } from '../src/proof-provider-timeout-decode.mjs';

describe('proof-provider-timeout-decode', () => {
  it('classifies AbortError as timeout-as-abort', () => {
    const r = decodeProofProviderTimeout('AbortError: The user aborted a request.');
    expect(r.ok).toBe(true);
    expect(r.kind).toBe('timeout-as-abort');
    expect(r.upstream).toContain('243');
  });

  it('does not classify a status-line rejection as timeout', () => {
    const r = decodeProofProviderTimeout('Failed Proof Server response: url="http://127.0.0.1:6300/check", code="400", status="Bad Request"');
    expect(r.ok).toBe(false);
    expect(r.kind).toBe('other');
  });
});
