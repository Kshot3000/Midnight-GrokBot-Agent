import { describe, it, expect } from 'vitest';
import {
  SUCCESS_CRITERIA,
  proveHelloLocal,
  resolveHelloCircuit,
  normalizeHelloNote,
  makeHelloNoteWitnesses,
  EMPTY_NOTE,
  HELLO_CIRCUITS,
} from '../src/prove-hello-local.mjs';
import { probeProofServer } from '../src/providers.mjs';
import { PREPROD } from '../src/preprod-config.mjs';

describe('prove-hello-local success criteria docs', () => {
  it('documents required criteria keys', () => {
    expect(SUCCESS_CRITERIA.proofServerHealth).toMatch(/health/);
    expect(SUCCESS_CRITERIA.prove).toMatch(/prove/);
    expect(SUCCESS_CRITERIA.recordNote).toMatch(/localNote/);
    expect(SUCCESS_CRITERIA.claim).toMatch(/NOT a Preprod deploy/);
    expect(HELLO_CIRCUITS).toEqual(['increment', 'recordNote']);
  });
});

describe('hello localNote witness', () => {
  it('defaults to increment and rejects unknown circuits', () => {
    expect(resolveHelloCircuit()).toBe('increment');
    expect(resolveHelloCircuit('recordNote')).toBe('recordNote');
    expect(() => resolveHelloCircuit('settle')).toThrow(/Unknown hello circuit/);
  });

  it('rejects an empty note and returns the witness tuple', () => {
    expect(() => normalizeHelloNote(EMPTY_NOTE)).toThrow(/non-empty/);
    expect(() => normalizeHelloNote('00'.repeat(32))).toThrow(/non-empty/);
    const note = normalizeHelloNote('ab'.repeat(32));
    expect(note).toHaveLength(32);
    const witnesses = makeHelloNoteWitnesses(note);
    const [next, value] = witnesses.localNote({ privateState: { tag: 'lab' } });
    expect(next).toEqual({ tag: 'lab' });
    expect(value).toBe(note);
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
    expect(report.circuit).toBe('increment');
    expect(report.greetings.before).toBe('0');
    expect(report.greetings.after).toBe('1');
    expect(report.preimageBytes).toBeGreaterThan(0);
    expect(report.proofBytes).toBeGreaterThan(100);
    expect(report.claim).toMatch(/NOT a Preprod deploy/);
  }, 200_000);
});
