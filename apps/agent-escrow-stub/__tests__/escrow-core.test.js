import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  freshEscrow,
  applyAction,
  can,
  stateAllows,
  roleAllows,
  balance,
  nextAction,
  normalizeEscrow,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
  deadlineOpen,
  ESCROW_STATES,
  MILESTONE_STATUSES,
  EXPORT_KIND,
  SCHEMA_VERSION,
  L,
} from '../escrow-core.mjs';

describe('role + state gates', () => {
  it('agent cannot fund; client can in created', () => {
    const s = freshEscrow();
    expect(roleAllows('agent', 'fund')).toBe(false);
    expect(roleAllows('client', 'fund')).toBe(true);
    expect(stateAllows(s, 'fund')).toBe(true);
    expect(can(s, 'client', 'fund')).toBe(true);
    expect(can(s, 'agent', 'fund')).toBe(false);
  });
});

describe('happy path + reject branch', () => {
  it('fund → start → proofs → approve/reject → settle', () => {
    let s = freshEscrow();
    expect(nextAction(s, 'client')).toBe('fund');
    s = applyAction(s, 'fund').escrow;
    expect(s.state).toBe('funded');
    expect(s.funded).toBe(5 * L);
    s = applyAction(s, 'start').escrow;
    expect(s.state).toBe('in_progress');
    s = applyAction(s, 'proof1', { proofHash: '0xaaa', privateNote: 'n1' }).escrow;
    expect(s.milestones[0].status).toBe('proof_submitted');
    s = applyAction(s, 'approve1').escrow;
    expect(s.released).toBe(1 * L);
    s = applyAction(s, 'proof2', { proofHash: '0xbbb' }).escrow;
    s = applyAction(s, 'reject2').escrow;
    expect(s.milestones[1].status).toBe('rejected');
    s = applyAction(s, 'settle').escrow;
    expect(s.state).toBe('settled');
    expect(balance(s)).toBe(0);
  });

  it('agent can resubmit a rejected proof before settle', () => {
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'start').escrow;
    s = applyAction(s, 'proof2', { proofHash: '0xbbb' }).escrow;
    s = applyAction(s, 'reject2').escrow;
    expect(s.milestones[1].status).toBe('rejected');
    expect(can(s, 'agent', 'proof2')).toBe(true);
    expect(stateAllows(s, 'settle')).toBe(false);
    const again = applyAction(s, 'proof2', { proofHash: '0xccc', privateNote: 'retry' });
    expect(again.ok).toBe(true);
    expect(again.escrow.milestones[1].status).toBe('proof_submitted');
    expect(again.escrow.milestones[1].proofHash).toBe('0xccc');
    expect(again.escrow.milestones[1].privateNote).toBe('retry');
    expect(again.escrow.audit.at(-1).type).toBe('proof_resubmitted');
    expect(stateAllows(again.escrow, 'settle')).toBe(false);
    // Once resubmitted, m2 is proof_submitted again — no open proof slot.
    // (This assertion previously ran proof1 against the pre-resubmit state,
    // where m1 is legitimately pending, so it could never pass.)
    const blocked = applyAction(again.escrow, 'proof2', { proofHash: '0xddd' });
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toMatch(/no open proof slot/);
  });

  it('dispute → refund', () => {
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'dispute').escrow;
    expect(s.state).toBe('disputed');
    expect(s.resumeTo).toBe('funded');
    s = applyAction(s, 'refund').escrow;
    expect(s.state).toBe('refunded');
    expect(s.refunded).toBe(5 * L);
  });

  it('resume from funded does not skip start', () => {
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'dispute').escrow;
    s = applyAction(s, 'resume').escrow;
    expect(s.state).toBe('funded');
    expect(s.resumeTo).toBe(null);
    expect(s.audit.at(-1).data.to).toBe('funded');
    expect(can(s, 'client', 'start')).toBe(true);
    expect(can(s, 'agent', 'proof1')).toBe(false);
    expect(stateAllows(s, 'settle')).toBe(false);
  });

  it('resume from in_progress restores work', () => {
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'start').escrow;
    s = applyAction(s, 'dispute').escrow;
    expect(s.resumeTo).toBe('in_progress');
    s = applyAction(s, 'resume').escrow;
    expect(s.state).toBe('in_progress');
    expect(can(s, 'agent', 'proof1')).toBe(true);
  });

  it('resume without a restorable state fails closed', () => {
    const broken = {
      ...applyAction(freshEscrow(), 'fund').escrow,
      state: 'disputed',
      resumeTo: null,
    };
    expect(stateAllows(broken, 'resume')).toBe(false);
    expect(can(broken, 'client', 'resume')).toBe(false);
    expect(can(broken, 'client', 'refund')).toBe(true);
    const resumed = applyAction(broken, 'resume');
    expect(resumed.ok).toBe(false);
    expect(resumed.error).toMatch(/no restorable state/);
    expect(resumed.escrow.state).toBe('disputed');
    expect(resumed.escrow.resumeTo).toBe(null);
  });

  it('rejects proof and approve at or after a milestone deadline', () => {
    // Compact blockTimeLt is strict-before. deadline 0 (fresh milestones) stays open.
    const cutoff = 1_700_000_000;
    expect(deadlineOpen({ deadline: 0 }, cutoff)).toBe(true);
    expect(deadlineOpen({ deadline: cutoff }, cutoff - 1)).toBe(true);
    expect(deadlineOpen({ deadline: cutoff }, cutoff)).toBe(false);
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'start').escrow;
    s.milestones[0].deadline = cutoff;
    const late = applyAction(s, 'proof1', { proofHash: '0xaaa', now: cutoff });
    expect(late.ok).toBe(false);
    expect(late.error).toMatch(/deadline passed/);
    expect(late.escrow.milestones[0].status).toBe('pending');
    const early = applyAction(s, 'proof1', { proofHash: '0xaaa', now: cutoff - 1 });
    expect(early.ok).toBe(true);
    expect(early.escrow.milestones[0].status).toBe('proof_submitted');
    const lateApprove = applyAction(early.escrow, 'approve1', { now: cutoff });
    expect(lateApprove.ok).toBe(false);
    expect(lateApprove.error).toMatch(/deadline passed/);
    expect(lateApprove.escrow.released).toBe(0);
  });

  it('rejects illegal transition', () => {
    const r = applyAction(freshEscrow(), 'settle');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/in_progress/);
  });
});

describe('normalize + export/import', () => {
  it('round-trips export document', () => {
    let escrow = applyAction(freshEscrow(), 'fund').escrow;
    const state = normalizeStudioState({ escrow, activeRole: 'agent' });
    expect(state.schemaVersion).toBe(SCHEMA_VERSION);
    const doc = buildExportDocument(state);
    expect(doc.kind).toBe(EXPORT_KIND);
    expect(doc.handle).toBe('@kshot9000');
    const parsed = parseImportDocument(JSON.stringify(doc));
    expect(parsed.ok).toBe(true);
    expect(parsed.state.escrow.state).toBe('funded');
    expect(parsed.state.activeRole).toBe('agent');
  });

  it('rejects garbage import', () => {
    expect(parseImportDocument('{').ok).toBe(false);
    expect(parseImportDocument({ kind: 'nope' }).ok).toBe(false);
  });

  it('hostile import: state/status fall back to whitelists, text stays data', () => {
    const parsed = parseImportDocument(
      JSON.stringify({
        kind: EXPORT_KIND,
        state: {
          activeRole: 'client',
          escrow: {
            state: '<img src=x onerror=alert(1)>',
            funded: 5 * L,
            milestones: [
              {
                id: 'm1',
                description: '<svg onload=alert(2)>',
                amount: 1 * L,
                status: 'x" onmouseover="alert(3)',
                proofHash: '<b>h</b>',
              },
            ],
            audit: ['not-an-object', { seq: 1, type: 't', actor: 'a', state: 'funded', data: [] }],
          },
        },
      }),
    );
    expect(parsed.ok).toBe(true);
    expect(ESCROW_STATES).toContain(parsed.state.escrow.state);
    expect(parsed.state.escrow.state).toBe('created');
    expect(MILESTONE_STATUSES).toContain(parsed.state.escrow.milestones[0].status);
    expect(parsed.state.escrow.milestones[0].status).toBe('pending');
    // Description/proofHash are preserved as inert data — the render layer
    // escapes them (guarded below); the core must not silently mangle text.
    expect(parsed.state.escrow.milestones[0].description).toBe('<svg onload=alert(2)>');
    // Audit entries are normalized to objects; junk and array data dropped.
    expect(parsed.state.escrow.audit).toHaveLength(1);
    expect(parsed.state.escrow.audit[0].data).toEqual({});
  });

  it('hostile import: non-finite and negative money becomes 0', () => {
    // JSON 1e999 parses to Infinity in JS.
    const inf = normalizeEscrow(JSON.parse('{"state":"funded","funded":1e999,"released":0,"refunded":0}'));
    expect(inf.funded).toBe(0);
    expect(Number.isFinite(balance(inf))).toBe(true);
    const neg = normalizeEscrow({
      state: 'funded',
      funded: 100,
      released: -50,
      refunded: -1,
      milestones: [{ id: 'm1', description: 'x', amount: -1000000, status: 'released' }],
    });
    expect(neg.released).toBe(0);
    expect(neg.refunded).toBe(0);
    expect(neg.milestones[0].amount).toBe(0);
    expect(balance(neg)).toBe(100);
    expect(balance({ funded: Infinity, released: 0, refunded: 0 })).toBe(0);
  });
});

describe('render hygiene (main.js)', () => {
  const main = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  it('milestone renderers escape every interpolated milestone field', () => {
    for (const needle of [
      'escapeHtml(m.id)',
      'escapeHtml(m.description)',
      'escapeHtml(m.amount)',
      'escapeHtml(m.status)',
      "escapeHtml(m.proofHash || '—')",
      'escapeHtml(p.stepCount)',
    ]) {
      expect(main).toContain(needle);
    }
    expect(main).not.toContain('${m.description}');
    expect(main).not.toContain('${m.proofHash ||');
    expect(main).not.toContain('<td>${p.stepCount}</td>');
  });
});
