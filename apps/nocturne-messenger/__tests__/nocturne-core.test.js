import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  cleanHandle,
  threadStats,
  messageCommitPayload,
  deviceCommitPayload,
  EXPORT_KIND,
  SCHEMA_VERSION,
} from '../nocturne-core.mjs';

describe('nocturne helpers', () => {
  it('cleanHandle', () => {
    expect(cleanHandle('@KShot_Lab!')).toBe('kshot_lab');
    expect(cleanHandle('a')).toBe('a');
  });

  it('threadStats', () => {
    const s = threadStats({
      moon: [
        { veiled: true, revealed: false, commit: 'c1' },
        { veiled: false, revealed: true, commit: 'c2' },
      ],
    });
    expect(s.messages).toBe(2);
    expect(s.veiled).toBe(1);
    expect(s.commits).toBe(2);
  });

  it('payloads are domain-separated', () => {
    expect(messageCommitPayload('t', 'h', 's', 'b')).toContain('nocturne:msg:');
    expect(deviceCommitPayload('h', 's', true)).toContain('nocturne:device:');
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      identity: { handle: 'ada', commit: 'c', sealedAt: 'now', passWrapped: false },
      threads: { moon: [{ id: 'm1', from: 'ada', body: 'hi', commit: 'x', salt: 's', ts: 1, mine: true, veiled: true, revealed: false }] },
      phase: 'committed',
      activeThreadId: 'moon',
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.threads.moon).toHaveLength(1);
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('migrates legacy v1 shape', () => {
    const state = normalizeStudioState({
      identity: { handle: 'x', commit: 'c', sealedAt: 't', passWrapped: false },
      threads: {},
      phase: 'identity',
    });
    expect(state.schemaVersion).toBe(2);
    expect(state.identity.handle).toBe('x');
  });
});
