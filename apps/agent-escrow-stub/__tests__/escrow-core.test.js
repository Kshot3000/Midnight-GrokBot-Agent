import { describe, expect, it } from 'vitest';
import {
  freshEscrow,
  applyAction,
  can,
  stateAllows,
  roleAllows,
  balance,
  nextAction,
  normalizeStudioState,
  buildExportDocument,
  parseImportDocument,
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
    const blocked = applyAction(s, 'proof1', { proofHash: '0xddd' });
    expect(blocked.ok).toBe(false);
    expect(blocked.error).toMatch(/no open proof slot/);
  });

  it('dispute → refund', () => {
    let s = applyAction(freshEscrow(), 'fund').escrow;
    s = applyAction(s, 'dispute').escrow;
    expect(s.state).toBe('disputed');
    s = applyAction(s, 'refund').escrow;
    expect(s.state).toBe('refunded');
    expect(s.refunded).toBe(5 * L);
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
});
