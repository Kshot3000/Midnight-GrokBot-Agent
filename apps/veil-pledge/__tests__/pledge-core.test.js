import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  normalizeDraft,
  finiteNonNeg,
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

describe('hostile imports cannot fake money or crash the board', () => {
  it('finiteNonNeg clamps non-finite / negative / non-numeric to 0', () => {
    expect(finiteNonNeg(5)).toBe(5);
    expect(finiteNonNeg('5')).toBe(5);
    expect(finiteNonNeg(Infinity)).toBe(0);
    expect(finiteNonNeg(-50)).toBe(0);
    expect(finiteNonNeg('abc')).toBe(0);
    expect(finiteNonNeg(NaN)).toBe(0);
    expect(finiteNonNeg(null)).toBe(0);
  });

  it('normalize clamps a JSON 1e999 (Infinity) amount and a negative amount to 0', () => {
    const hostile = JSON.parse(
      '{"pledges":[{"id":"p1","commitment":"c","amount":1e999,"disclosure":"sealed"},' +
        '{"id":"p2","commitment":"c","amount":-50,"disclosure":"full"}]}',
    );
    const state = normalizeStudioState(hostile);
    expect(state.pledges[0].amount).toBe(0);
    expect(state.pledges[1].amount).toBe(0);
    expect(pledgeStats(state.pledges).sum).toBe(0);
  });

  it('an Infinity amount can no longer prove a threshold', () => {
    expect(proveThreshold({ amount: Infinity }, 5).ok).toBe(false);
    expect(proveThreshold({ amount: 0 }, 5).ok).toBe(false);
    expect(proveThreshold({ amount: 'abc' }, 5).ok).toBe(false);
  });

  it('hostile rangeMin is dropped; a valid one survives', () => {
    const bad = normalizeStudioState({
      pledges: [{ id: 'p1', commitment: 'c', amount: 10, disclosure: 'range', rangeMin: 'abc' }],
    });
    expect(bad.pledges[0].rangeMin).toBeUndefined();
    const inf = normalizeStudioState(
      JSON.parse('{"pledges":[{"id":"p1","commitment":"c","amount":10,"disclosure":"range","rangeMin":1e999}]}'),
    );
    expect(inf.pledges[0].rangeMin).toBeUndefined();
    const good = normalizeStudioState({
      pledges: [{ id: 'p1', commitment: 'c', amount: 10, disclosure: 'range', rangeMin: 5 }],
    });
    expect(good.pledges[0].rangeMin).toBe(5);
  });

  it('drafts are typed by normalize — a string amount can no longer crash the preview', () => {
    const state = normalizeStudioState({
      pledges: [],
      draft: { commitment: 'c', amount: '50', note: 'n', handle: '@x', salt: 's' },
    });
    expect(state.draft.amount).toBe(50);
    expect(typeof state.draft.amount).toBe('number');
    expect(state.draft.amount.toFixed(2)).toBe('50.00');
    // No commitment → no draft (the board never renders a half draft)
    expect(normalizeDraft({ amount: 5 })).toBe(null);
    expect(normalizeStudioState({ pledges: [], draft: { amount: 5 } }).draft).toBe(null);
  });

  it('commitHash sanitizes hostile amounts instead of hashing "Infinity"', async () => {
    const payloads = [];
    const digestFn = async (t) => {
      payloads.push(t);
      return 'ab';
    };
    await commitHash(Infinity, 'n', 's', digestFn);
    await commitHash(-50, 'n', 's', digestFn);
    expect(payloads[0]).toContain('|0.0000|');
    expect(payloads[1]).toContain('|0.0000|');
  });
});
