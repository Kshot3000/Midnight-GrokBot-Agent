import { describe, expect, it } from 'vitest';
import {
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  proveSeatsRemain,
  seatsUsed,
  inviteStats,
  EXPORT_KIND,
  SCHEMA_VERSION,
  inviteCommit,
  rsvpCommit,
} from '../invite-core.mjs';

describe('invite helpers', () => {
  it('seatsUsed counts plus-ones', () => {
    expect(seatsUsed({ rsvps: [{ plusOnes: 2 }, { plusOnes: 0 }] })).toBe(4);
  });

  it('proveSeatsRemain', () => {
    const inv = { capacity: 5, rsvps: [{ id: 'a', plusOnes: 1 }] };
    expect(proveSeatsRemain(inv, { id: 'a', plusOnes: 1 }).ok).toBe(true);
    expect(proveSeatsRemain(inv, { id: 'b', plusOnes: 3 }).ok).toBe(false);
  });

  it('inviteStats', () => {
    const s = inviteStats([
      { disclosure: 'sealed', rsvps: [{ admitted: true }, {}] },
      { disclosure: 'full', rsvps: [] },
    ]);
    expect(s.invites).toBe(2);
    expect(s.rsvps).toBe(2);
    expect(s.admitted).toBe(1);
  });

  it('commits are domain-separated', async () => {
    const digestFn = async (t) => t.slice(0, 28);
    const a = await inviteCommit(10, 'vault', 's', digestFn);
    const b = await rsvpCommit('Ada', 1, 'id', 's', digestFn);
    expect(a).toContain('sealed-invite:invite');
    expect(b).toContain('sealed-invite:rsvp');
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    const state = normalizeStudioState({
      invites: [
        {
          id: 'i1',
          title: 'Salon',
          capacity: 8,
          commitment: 'c',
          disclosure: 'sealed',
          rsvps: [{ id: 'r1', name: 'Ada', plusOnes: 1, commitment: 'rc', disclosure: 'sealed' }],
        },
      ],
    });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.invites[0].rsvps[0].name).toBe('Ada');
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });
});
