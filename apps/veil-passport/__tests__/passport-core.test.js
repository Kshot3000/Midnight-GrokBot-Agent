import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  phaseOf,
  passportStats,
  claimCommitPayload,
  EXPORT_KIND,
  SCHEMA_VERSION,
} from '../passport-core.mjs';

describe('passport helpers', () => {
  it('phaseOf', () => {
    expect(phaseOf(null)).toBe('idle');
    expect(phaseOf({ revoked: true })).toBe('revoked');
    expect(phaseOf({ presented: true, disclosed: ['age'] })).toBe('proven');
    expect(phaseOf({ presented: true })).toBe('presented');
    expect(phaseOf({ id: 'x' })).toBe('issued');
  });

  it('passportStats', () => {
    const s = passportStats([
      { presented: true, disclosed: ['age'] },
      { presented: false, revoked: true },
      {},
    ]);
    expect(s.issued).toBe(3);
    expect(s.presented).toBe(1);
    expect(s.proven).toBe(1);
    expect(s.revoked).toBe(1);
  });

  it('claimCommitPayload domain-separated', () => {
    expect(claimCommitPayload({ displayName: 'a', age: 1, role: 'r', membership: 'm' }, 's')).toContain(
      'veil-passport:v1',
    );
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      passports: [
        {
          id: 'pp_1',
          displayName: 'Ada',
          age: 28,
          role: 'builder',
          membership: 'night',
          region: 'EU',
          salt: 's',
          holderSecret: 'h',
          commit: 'c',
          issuerSig: 'i',
          issuedAt: 'now',
          presented: true,
          revoked: false,
          disclosed: ['age', 'bogus'],
        },
      ],
      activeId: 'pp_1',
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(state.passports[0].disclosed).toEqual(['age']);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.passports).toHaveLength(1);
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('migrates legacy shape', () => {
    const state = normalizeStudioState({
      passports: [{ id: 'x', displayName: 'n', age: 20, role: 'r', membership: 'm', salt: 's', commit: 'c' }],
      activeId: 'x',
    });
    expect(state.schemaVersion).toBe(2);
  });
});
