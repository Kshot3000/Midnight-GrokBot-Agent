import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
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
});
