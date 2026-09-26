import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  EXPORT_KIND,
  SCHEMA_VERSION,
  LESSON_IDS,
} from '../atelier-core.mjs';

describe('atelier normalize + export/import', () => {
  it('has curated lesson ids', () => {
    expect(LESSON_IDS.length).toBeGreaterThan(0);
    expect(LESSON_IDS).toContain('hello-counter');
  });

  it('round-trips export document', () => {
    const state = normalizeStudioState({
      lessonId: 'hello-counter',
      source: 'pragma language_version >= 0.23;',
      baselineSource: 'pragma language_version >= 0.23;',
      explained: true,
      linted: false,
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.phase).toBe('explained');
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.lessonId).toBe('hello-counter');
  });

  it('rejects garbage', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('marks edited when source diverges', () => {
    const s = normalizeStudioState({
      lessonId: 'hello-counter',
      source: 'edited',
      baselineSource: 'base',
    });
    expect(s.phase).toBe('edited');
  });
});
