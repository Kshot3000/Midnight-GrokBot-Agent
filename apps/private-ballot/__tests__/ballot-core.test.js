import { describe, expect, it } from 'vitest';
import {
  parseOptions,
  findDuplicateNullifier,
  hasNullifierCollision,
  aggregateTally,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  EXPORT_KIND,
  SCHEMA_VERSION,
  mergeVault,
} from '../ballot-core.mjs';

describe('parseOptions', () => {
  it('trims, dedupes case-insensitively, caps at 6', () => {
    expect(parseOptions('Yes\nNo\nyes\n\nMaybe')).toEqual(['Yes', 'No', 'Maybe']);
    const many = Array.from({ length: 10 }, (_, i) => `Opt ${i}`).join('\n');
    expect(parseOptions(many)).toHaveLength(6);
  });
});

describe('nullifiers', () => {
  it('detects double-vote on same nullifier', () => {
    const votes = [
      { ballotId: 'b1', nullifier: 'abc', rejected: false },
      { ballotId: 'b1', nullifier: 'def', rejected: false },
    ];
    expect(findDuplicateNullifier(votes, 'b1', 'abc')).toBe(true);
    expect(findDuplicateNullifier(votes, 'b1', 'zzz')).toBe(false);
    expect(findDuplicateNullifier(votes, 'b2', 'abc')).toBe(false);
  });

  it('collision scan', () => {
    expect(hasNullifierCollision([{ nullifier: 'a' }, { nullifier: 'b' }])).toBe(false);
    expect(hasNullifierCollision([{ nullifier: 'a' }, { nullifier: 'a' }])).toBe(true);
  });
});

describe('aggregateTally', () => {
  it('counts by choiceLabel', () => {
    const tally = aggregateTally(['Yes', 'No'], [
      { choiceLabel: 'Yes' },
      { choiceLabel: 'Yes' },
      { choiceLabel: 'No', rejected: true },
      { choiceLabel: 'No' },
    ]);
    expect(tally).toEqual({ Yes: 2, No: 1 });
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      ballots: [{ id: 'b1', question: 'Q?', options: ['A', 'B'] }],
      votes: [{ id: 'v1', ballotId: 'b1', nullifier: 'n1', choiceLabel: 'A' }],
      rejectCount: 2,
      activeId: 'b1',
      vault: { b1: { eligSalt: 'salt' } },
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.ballots[0].id).toBe('b1');
    expect(parsed.state.vault.b1.eligSalt).toBe('salt');
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument('{}').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('merges vault salts', () => {
    const m = mergeVault({ a: { eligSalt: '1' } }, { a: {}, b: { eligSalt: '2' } });
    expect(m.a.eligSalt).toBe('1');
    expect(m.b.eligSalt).toBe('2');
  });
});
