import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  historyStats,
  EXPORT_KIND,
  SCHEMA_VERSION,
} from '../proof-core.mjs';

describe('proof helpers', () => {
  it('historyStats', () => {
    const s = historyStats([
      { verified: true },
      { verified: false },
      { verified: null },
    ]);
    expect(s.runs).toBe(3);
    expect(s.ok).toBe(1);
    expect(s.fail).toBe(1);
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      history: [
        {
          id: 'h1',
          circuitId: 'range',
          name: 'Age range',
          blob: 'abc',
          verified: true,
          at: 'now',
          note: 'ok',
        },
      ],
      activeId: 'equality',
      presets: { range: { circuitId: 'range', witnesses: { age: 30 }, label: 'demo' } },
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.activeId).toBe('equality');
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.history).toHaveLength(1);
    expect(parsed.state.presets.range.witnesses.age).toBe(30);
  });

  it('rejects garbage / migrates legacy', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
    const legacy = normalizeStudioState({ history: [{ id: 'x', circuitId: 'range', name: 'n', blob: 'b', verified: false, at: 't', note: '' }], activeId: 'range' });
    expect(legacy.schemaVersion).toBe(2);
  });

  it('clamps unknown activeId', () => {
    expect(normalizeStudioState({ activeId: 'nope' }).activeId).toBe('commit');
  });
});
