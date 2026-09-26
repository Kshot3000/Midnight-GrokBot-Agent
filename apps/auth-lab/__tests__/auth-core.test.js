import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  computeScoreHealth,
  forgeCanBypass,
  derivePkSync,
  EXPORT_KIND,
  SCHEMA_VERSION,
  DONATE_ADDR,
} from '../auth-core.mjs';

describe('auth helpers', () => {
  it('forgeCanBypass matches owner claim', () => {
    const pk = 'a'.repeat(64);
    expect(forgeCanBypass(pk, pk).ok).toBe(true);
    expect(forgeCanBypass(pk, 'b'.repeat(64)).ok).toBe(false);
    expect(forgeCanBypass(null, pk).ok).toBe(false);
  });

  it('derivePkSync is deterministic and domain-separated', () => {
    const a = derivePkSync('deadbeef'.padEnd(64, '0'));
    const b = derivePkSync('deadbeef'.padEnd(64, '0'));
    const c = derivePkSync('cafebabe'.padEnd(64, '0'));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toHaveLength(64);
  });

  it('computeScoreHealth', () => {
    const items = [
      { id: 's1', kind: 'safe' },
      { id: 's2', kind: 'safe' },
      { id: 'u1', kind: 'unsafe' },
    ];
    expect(computeScoreHealth({}, items).health).toBeNull();
    const mixed = computeScoreHealth({ s1: true, u1: true }, items);
    expect(mixed.safeN).toBe(1);
    expect(mixed.unsafeN).toBe(1);
    expect(mixed.health).toBeGreaterThanOrEqual(0);
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      sk: 'ab'.repeat(32),
      posts: [
        {
          id: 'p1',
          seq: 1,
          body: 'hello veil',
          ownerPk: 'cd'.repeat(32),
          ts: 1,
        },
      ],
      score: { s1: true },
      forge: { phase: 'deployed', ownerPk: 'ef'.repeat(32), forged: false, log: ['x'] },
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.posts).toHaveLength(1);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    expect(doc.donate).toBe(DONATE_ADDR);
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.posts[0].body).toBe('hello veil');
    expect(parsed.state.forge.phase).toBe('deployed');
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('migrates legacy bare posts array', () => {
    const state = normalizeStudioState([
      { id: 'legacy', seq: 1, body: 'hi', ownerPk: 'aa'.repeat(32), ts: 9 },
    ]);
    expect(state.schemaVersion).toBe(2);
    expect(state.posts[0].id).toBe('legacy');
  });
});
