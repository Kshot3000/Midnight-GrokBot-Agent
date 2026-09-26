import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  proveThreshold,
  pledgeStats,
  EXPORT_KIND,
  SCHEMA_VERSION,
  commitHash,
} from '../pledge-core.mjs';

describe('pledge helpers', () => {
  it('proveThreshold accepts at/above and rejects below', () => {
    expect(proveThreshold({ amount: 5 }, 5).ok).toBe(true);
    expect(proveThreshold({ amount: 4.9 }, 5).ok).toBe(false);
    expect(proveThreshold(null, 1).ok).toBe(false);
  });

  it('pledgeStats', () => {
    const s = pledgeStats([
      { disclosure: 'sealed', amount: 2 },
      { disclosure: 'full', amount: 3 },
    ]);
    expect(s).toEqual({ total: 2, sealed: 1, disclosed: 1, sum: 5 });
  });

  it('commitHash is deterministic for same inputs', async () => {
    const digests = [];
    const digestFn = async (t) => {
      digests.push(t);
      // trivial stub digest
      let h = 0;
      for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      return h.toString(16).padStart(8, '0');
    };
    const a = await commitHash(1.5, 'hi', 'salt', digestFn);
    const b = await commitHash(1.5, 'hi', 'salt', digestFn);
    expect(a).toBe(b);
    expect(digests[0]).toContain('veil-pledge:commit:v1');
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      pledges: [
        {
          id: 'p1',
          handle: '@k',
          commitment: 'abc',
          salt: 's',
          amount: 2,
          note: 'n',
          createdAt: '2026-01-01',
          disclosure: 'sealed',
        },
      ],
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.pledges[0].id).toBe('p1');
  });

  it('migrates legacy bare array', () => {
    const state = normalizeStudioState([{ id: 'x', commitment: 'c', amount: 1, disclosure: 'sealed' }]);
    expect(state.pledges).toHaveLength(1);
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument('{}').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });
});
