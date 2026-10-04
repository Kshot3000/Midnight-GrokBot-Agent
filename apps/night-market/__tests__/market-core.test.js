import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  normalizeStudioState,
  normalizeDraft,
  finiteNonNeg,
  buildExportDocument,
  parseImportDocument,
  proveBidClearsReserve,
  marketStats,
  EXPORT_KIND,
  SCHEMA_VERSION,
  listingCommit,
  bidCommit,
} from '../market-core.mjs';

describe('market helpers', () => {
  it('proveBidClearsReserve', () => {
    expect(proveBidClearsReserve({ reserve: 10 }, { amount: 10 }).ok).toBe(true);
    expect(proveBidClearsReserve({ reserve: 10 }, { amount: 9 }).ok).toBe(false);
  });

  it('marketStats', () => {
    const s = marketStats([
      { disclosure: 'sealed', status: 'open', bids: [{}, {}] },
      { disclosure: 'full', status: 'awarded', bids: [{}] },
    ]);
    expect(s.listings).toBe(2);
    expect(s.bids).toBe(3);
    expect(s.awarded).toBe(1);
  });

  it('commits are domain-separated', async () => {
    const digestFn = async (t) => t.slice(0, 24);
    const l = await listingCommit(5, 'd', 's', digestFn);
    const b = await bidCommit(5, 'id', 's', digestFn);
    expect(l).toContain('night-market:listing');
    expect(b).toContain('night-market:bid');
    expect(l).not.toBe(b);
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      listings: [
        {
          id: 'l1',
          title: 'Lamp',
          reserve: 3,
          commitment: 'c',
          disclosure: 'sealed',
          status: 'open',
          bids: [{ id: 'b1', amount: 4, commitment: 'bc', disclosure: 'sealed' }],
        },
      ],
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.listings[0].bids).toHaveLength(1);
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('finiteNonNeg clamps non-finite and negative money to 0', () => {
    expect(finiteNonNeg(5)).toBe(5);
    expect(finiteNonNeg(0)).toBe(0);
    expect(finiteNonNeg(-50)).toBe(0);
    expect(finiteNonNeg(Infinity)).toBe(0);
    expect(finiteNonNeg('not-a-number')).toBe(0);
    expect(finiteNonNeg(null)).toBe(0);
  });

  it('hostile import cannot fake money (1e999 / negative / string amounts)', () => {
    // Raw JSON text: JSON.parse turns 1e999 into Infinity.
    const text =
      `{"kind":"${EXPORT_KIND}","state":{"listings":[` +
      `{"id":"l1","title":"X","reserve":1e999,"disclosure":"full","bids":[` +
      `{"id":"b1","amount":1e999,"handle":"@evil","disclosure":"full"},` +
      `{"id":"b2","amount":-999,"handle":"@neg","disclosure":"full"},` +
      `{"id":"b3","amount":"lots","handle":"@nan","disclosure":"full"}]},` +
      `{"id":"l2","title":"Y","reserve":-50,"disclosure":"full","bids":[]}]}}`;
    const imp = parseImportDocument(text);
    expect(imp.ok).toBe(true);
    const [l1, l2] = imp.state.listings;
    expect(l1.reserve).toBe(0);
    expect(l1.bids.map((b) => b.amount)).toEqual([0, 0, 0]);
    expect(l2.reserve).toBe(0);
    // Nothing non-finite or negative survives to the renderer.
    for (const l of imp.state.listings) {
      expect(Number.isFinite(l.reserve)).toBe(true);
      expect(l.reserve.toFixed(2)).not.toContain('Infinity');
      for (const b of l.bids) expect(Number.isFinite(b.amount)).toBe(true);
    }
    // A clamped 0 bid does NOT clear a clamped 0 reserve — no vacuous proof.
    expect(proveBidClearsReserve(l1, l1.bids[0]).ok).toBe(false);
    expect(proveBidClearsReserve(l2, { amount: 0 }).ok).toBe(false);
  });

  it('proveBidClearsReserve rejects non-positive / non-finite inputs', () => {
    expect(proveBidClearsReserve({ reserve: -50 }, { amount: 0 }).ok).toBe(false);
    expect(proveBidClearsReserve({ reserve: 10 }, { amount: Infinity }).ok).toBe(false);
    expect(proveBidClearsReserve({ reserve: Infinity }, { amount: 10 }).ok).toBe(false);
    expect(proveBidClearsReserve({ reserve: 10 }, { amount: 0 }).ok).toBe(false);
    expect(proveBidClearsReserve({ reserve: 10 }, { amount: 10 }).ok).toBe(true);
  });

  it('normalizeDraft types every field and never passes a raw reserve through', () => {
    const hostile = normalizeDraft({ commitment: 'abc', reserve: 'evil-string', title: 'T' });
    expect(typeof hostile.reserve).toBe('number');
    expect(hostile.reserve).toBe(0);
    expect(() => hostile.reserve.toFixed(2)).not.toThrow();
    expect(normalizeDraft({ commitment: 'abc', reserve: 1e999 }).reserve).toBe(0);
    expect(normalizeDraft({ commitment: 'abc', reserve: -5 }).reserve).toBe(0);
    const valid = normalizeDraft({
      commitment: 'abc', reserve: 25, title: 'Lamp', category: 'gear',
      seller: '@s', details: 'd', salt: 's',
    });
    expect(valid).toEqual({
      title: 'Lamp', category: 'gear', seller: '@s', reserve: 25,
      details: 'd', salt: 's', commitment: 'abc',
    });
    expect(normalizeDraft({ reserve: 5 })).toBe(null);
    expect(normalizeDraft('nope')).toBe(null);
    // normalizeStudioState applies the same typing to embedded drafts.
    const st = normalizeStudioState({ draft: { commitment: 'c', reserve: 'x' }, listings: [] });
    expect(typeof st.draft.reserve).toBe('number');
  });

  it('main.js prove/award go through proveBidClearsReserve (no raw amount comparisons)', () => {
    const main = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
    expect(main).toContain('proveBidClearsReserve(listing, bid)');
    expect(main).not.toContain('bid.amount >= listing.reserve');
    expect(main).not.toContain('bid.amount < listing.reserve');
  });
});
