import { describe, it, expect } from 'vitest';
import { SUCCESS_CRITERIA, proveHelloLocal } from '../src/prove-hello-local.mjs';
import { probeProofServer } from '../src/providers.mjs';
import { PREPROD } from '../src/preprod-config.mjs';

describe('prove-hello-local success criteria docs', () => {
  it('documents required criteria keys', () => {
    expect(SUCCESS_CRITERIA.proofServerHealth).toMatch(/health/);
    expect(SUCCESS_CRITERIA.prove).toMatch(/prove/);
    expect(SUCCESS_CRITERIA.claim).toMatch(/NOT a Preprod deploy/);
  });
});

describe('prove-hello-local live (optional)', () => {
  it('proves increment against local proof-server when healthy', async () => {
    const health = await probeProofServer(PREPROD.proofServer);
    if (!health.ok) {
      console.warn('skip live prove — proof-server down:', health.body);
      return;
    }
    const report = await proveHelloLocal({ timeout: 180_000 });
    expect(report.ok).toBe(true);
    expect(report.greetings.before).toBe('0');
    expect(report.greetings.after).toBe('1');
    expect(report.preimageBytes).toBeGreaterThan(0);
    expect(report.proofBytes).toBeGreaterThan(100);
    expect(report.claim).toMatch(/NOT a Preprod deploy/);
  }, 200_000);
});
