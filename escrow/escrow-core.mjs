/**
 * Agent Escrow — pure state-machine helpers (testable).
 * Teaching stand-in for Compact milestone escrow. Not on-chain.
 */

export const DOMAIN = 'agent-escrow:v1';
export const STORAGE_KEY = 'mn-agent-escrow-v1';
export const SCHEMA_VERSION = 2;
export const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';
export const EXPORT_KIND = 'midnight-lab.agent-escrow';
export const L = 1_000_000;
export const MAIN_PATH = ['created', 'funded', 'in_progress', 'settled'];
export const ESCROW_STATES = ['created', 'funded', 'in_progress', 'settled', 'disputed', 'refunded', 'cancelled'];
export const MILESTONE_STATUSES = ['pending', 'proof_submitted', 'released', 'rejected'];

/** Money fields: finite and non-negative, else 0. JSON `1e999` parses to
 *  Infinity and negative amounts used to pass normalize untouched, making
 *  balance() return Infinity or an inflated figure. */
export function finiteNonNeg(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export const ROLE_ACTS = {
  client: ['fund', 'start', 'settle', 'dispute', 'resume', 'refund', 'cancel', 'reset', 'approve1', 'reject2'],
  agent: ['proof1', 'proof2', 'reset'],
  approver: ['approve1', 'reject2', 'reset'],
};

export const WHY_DISABLED = {
  fund: 'Available only while state is created.',
  start: 'Fund the escrow first (state must be funded).',
  proof1: 'Needs in_progress and m1 pending or rejected (resubmit after reject).',
  approve1: 'Needs m1 in proof_submitted (agent must submit proof first).',
  proof2: 'Needs in_progress and m2 pending or rejected (resubmit after reject).',
  reject2: 'Needs m2 in proof_submitted (demo path: reject after proof).',
  settle: 'Needs every milestone released or rejected while in_progress.',
  dispute: 'Available from funded or in_progress only.',
  resume: 'Available only while disputed, and only if the pre-dispute state was funded or in_progress.',
  refund: 'Available only while disputed.',
  cancel: 'Available only before work starts (created or funded).',
  reset: 'Always available — clears local demo state.',
};

export const SUCCESS_MSG = {
  fund: 'Escrow funded with 5 ADA (local).',
  start: 'Work started — milestones are live.',
  proof1: 'Agent submitted proof for m1.',
  approve1: 'Approver released m1.',
  proof2: 'Agent submitted proof for m2.',
  reject2: 'Approver rejected m2 (demo path). Agent may resubmit.',
  settle: 'Escrow settled — remaining balance refunded locally.',
  dispute: 'Dispute opened.',
  resume: 'Dispute resolved — restored the pre-dispute state.',
  refund: 'Dispute refunded remaining balance.',
  cancel: 'Escrow cancelled — remaining balance refunded locally.',
  reset: 'Local demo reset.',
};

export const PROOF_NOTES = {
  m1: 'Private note: scaffolded Compact layout + witness stubs for role commitments (local only).',
  m2: 'Private note: app milestone — UI wired to local state machine; CI still red in demo reject path.',
};

export function freshEscrow() {
  return {
    state: 'created',
    resumeTo: null,
    funded: 0,
    released: 0,
    refunded: 0,
    milestones: [
      { id: 'm1', description: 'scaffold', amount: 1 * L, status: 'pending', proofHash: null, privateNote: null, deadline: 0 },
      { id: 'm2', description: 'app', amount: 4 * L, status: 'pending', proofHash: null, privateNote: null, deadline: 0 },
    ],
    audit: [],
  };
}

export function emptyStudioState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    escrow: freshEscrow(),
    activeRole: 'client',
    updatedAt: null,
  };
}

export function balance(escrow) {
  if (!escrow) return 0;
  return finiteNonNeg(escrow.funded) - finiteNonNeg(escrow.released) - finiteNonNeg(escrow.refunded);
}

export function findMilestone(escrow, id) {
  return (escrow?.milestones || []).find((m) => m.id === id) || null;
}

function cloneEscrow(escrow) {
  return {
    state: escrow.state,
    resumeTo: escrow.resumeTo || null,
    funded: escrow.funded,
    released: escrow.released,
    refunded: escrow.refunded,
    milestones: (escrow.milestones || []).map((m) => ({ ...m })),
    audit: (escrow.audit || []).map((e) => ({ ...e, data: { ...(e.data || {}) } })),
  };
}

export function pushAudit(escrow, type, actor, data) {
  const next = cloneEscrow(escrow);
  next.audit.push({
    seq: next.audit.length + 1,
    type,
    actor,
    state: next.state,
    data: data || {},
  });
  return next;
}

export function roleAllows(role, act) {
  return (ROLE_ACTS[role] || []).includes(act);
}

function proofSlotOpen(milestone) {
  return milestone?.status === 'pending' || milestone?.status === 'rejected';
}

/** Compact resolveDisputeResume only restores FUNDED or IN_PROGRESS. */
export function restorableDisputeState(escrow) {
  return escrow?.resumeTo === 'funded' || escrow?.resumeTo === 'in_progress';
}

/**
 * Compact blockTimeLt is strict-before. deadline 0 means unset (no cutoff).
 * nowSec is Unix seconds (payload.now in the studio; block time on-chain).
 */
export function deadlineOpen(milestone, nowSec) {
  const deadline = finiteNonNeg(milestone?.deadline);
  if (!deadline) return true;
  return Number(nowSec) < deadline;
}

function nowSeconds(payload) {
  if (payload && Number.isFinite(Number(payload.now))) return Math.floor(Number(payload.now));
  return Math.floor(Date.now() / 1000);
}

export function stateAllows(escrow, act) {
  const m1 = findMilestone(escrow, 'm1');
  const m2 = findMilestone(escrow, 'm2');
  switch (act) {
    case 'fund':
      return escrow.state === 'created';
    case 'start':
      return escrow.state === 'funded';
    case 'proof1':
      return escrow.state === 'in_progress' && proofSlotOpen(m1);
    case 'approve1':
      return escrow.state === 'in_progress' && m1?.status === 'proof_submitted';
    case 'proof2':
      return escrow.state === 'in_progress' && proofSlotOpen(m2);
    case 'reject2':
      return escrow.state === 'in_progress' && m2?.status === 'proof_submitted';
    case 'settle':
      return (
        escrow.state === 'in_progress' &&
        (escrow.milestones || []).every((m) => m.status === 'released' || m.status === 'rejected')
      );
    case 'dispute':
      return escrow.state === 'funded' || escrow.state === 'in_progress';
    case 'resume':
      return escrow.state === 'disputed' && restorableDisputeState(escrow);
    case 'refund':
      return escrow.state === 'disputed';
    case 'cancel':
      return escrow.state === 'created' || escrow.state === 'funded';
    case 'reset':
      return true;
    default:
      return false;
  }
}

export function can(escrow, role, act) {
  return roleAllows(role, act) && stateAllows(escrow, act);
}

export function nextAction(escrow, role) {
  const order = ['fund', 'start', 'proof1', 'approve1', 'proof2', 'reject2', 'settle', 'resume', 'refund'];
  return order.find((a) => can(escrow, role, a)) || null;
}

/**
 * Apply a sync or pre-hashed action. For proof1/proof2, pass { proofHash, privateNote }.
 * Returns { ok, escrow, error }.
 * proof1/proof2 match Compact submitProof: PENDING or REJECTED. A rejected
 * slot reopens so settle still waits until the new proof is decided.
 * dispute/resume match Compact resolveDisputeResume: resume restores FUNDED
 * or IN_PROGRESS only. A missing resumeTo fails closed (does not skip start()).
 * Non-zero milestone.deadline uses the same strict-before rule as blockTimeLt.
 * cancel matches Compact cancel(): only CREATED or FUNDED, then refund remainder.
 * LOCAL-TRUE studio stand-in — not an on-chain call.
 */
export function applyAction(escrow, act, payload = {}) {
  let s = cloneEscrow(escrow || freshEscrow());
  try {
    switch (act) {
      case 'fund': {
        if (s.state !== 'created') throw new Error('can only fund in created');
        s.funded = 5 * L;
        s.state = 'funded';
        s = pushAudit(s, 'funded', 'client', { amount: s.funded });
        break;
      }
      case 'start': {
        if (s.state !== 'funded') throw new Error('can only start in funded');
        const total = s.milestones.reduce((a, m) => a + m.amount, 0);
        if (total > s.funded) throw new Error('milestones exceed funded');
        s.state = 'in_progress';
        s = pushAudit(s, 'started', 'client', { milestoneTotal: total });
        break;
      }
      case 'proof1':
      case 'proof2': {
        const id = act === 'proof1' ? 'm1' : 'm2';
        if (s.state !== 'in_progress') throw new Error('need in_progress');
        const m = s.milestones.find((x) => x.id === id);
        if (!m || (m.status !== 'pending' && m.status !== 'rejected')) {
          throw new Error(`${id} has no open proof slot`);
        }
        if (!deadlineOpen(m, nowSeconds(payload))) throw new Error('milestone deadline passed');
        if (!payload.proofHash) throw new Error('proofHash required');
        const resubmit = m.status === 'rejected';
        m.privateNote = payload.privateNote || PROOF_NOTES[id] || null;
        m.proofHash = payload.proofHash;
        m.status = 'proof_submitted';
        s = pushAudit(s, resubmit ? 'proof_resubmitted' : 'proof_submitted', 'agent', {
          milestone: id,
          proofHash: m.proofHash,
        });
        break;
      }
      case 'approve1': {
        if (s.state !== 'in_progress') throw new Error('need in_progress');
        const m = s.milestones.find((x) => x.id === 'm1');
        if (!m || m.status !== 'proof_submitted') throw new Error('m1 needs proof');
        if (!deadlineOpen(m, nowSeconds(payload))) throw new Error('milestone deadline passed');
        m.status = 'released';
        s.released += m.amount;
        s = pushAudit(s, 'milestone_released', 'approver', { milestone: 'm1', amount: m.amount });
        break;
      }
      case 'reject2': {
        if (s.state !== 'in_progress') throw new Error('need in_progress');
        const m = s.milestones.find((x) => x.id === 'm2');
        if (!m || m.status !== 'proof_submitted') throw new Error('m2 needs proof');
        m.status = 'rejected';
        s = pushAudit(s, 'milestone_rejected', 'approver', { milestone: 'm2', reason: 'CI red' });
        break;
      }
      case 'settle': {
        if (s.state !== 'in_progress') throw new Error('need in_progress');
        const open = s.milestones.some((m) => m.status !== 'released' && m.status !== 'rejected');
        if (open) throw new Error('all milestones must be decided');
        const rem = balance(s);
        s.refunded += rem;
        s.state = 'settled';
        s = pushAudit(s, 'settled', 'client', { refund: rem });
        break;
      }
      case 'dispute': {
        if (s.state !== 'funded' && s.state !== 'in_progress') throw new Error('cannot dispute now');
        s.resumeTo = s.state;
        s.state = 'disputed';
        s = pushAudit(s, 'disputed', 'client', { from: s.resumeTo });
        break;
      }
      case 'resume': {
        if (s.state !== 'disputed') throw new Error('not disputed');
        if (!restorableDisputeState(s)) {
          throw new Error('dispute has no restorable state');
        }
        const back = s.resumeTo;
        s.state = back;
        s.resumeTo = null;
        s = pushAudit(s, 'dispute_resolved_resume', 'client', { to: back });
        break;
      }
      case 'refund': {
        if (s.state !== 'disputed') throw new Error('not disputed');
        const rem = balance(s);
        s.refunded += rem;
        s.state = 'refunded';
        s.resumeTo = null;
        s = pushAudit(s, 'dispute_resolved_refund', 'client', { refund: rem });
        break;
      }
      case 'cancel': {
        // Compact cancel(): CREATED or FUNDED only. Refund remaining, then CANCELLED.
        if (s.state !== 'created' && s.state !== 'funded') {
          throw new Error('can only cancel before work starts');
        }
        const rem = balance(s);
        s.refunded += rem;
        s.state = 'cancelled';
        s.resumeTo = null;
        s = pushAudit(s, 'cancelled', 'client', { refund: rem });
        break;
      }
      case 'reset': {
        s = freshEscrow();
        s = pushAudit(s, 'reset', 'ui', {});
        break;
      }
      default:
        throw new Error(`unknown action: ${act}`);
    }
    return { ok: true, escrow: s, error: null };
  } catch (e) {
    return { ok: false, escrow: cloneEscrow(escrow || freshEscrow()), error: e.message || String(e) };
  }
}

function normalizeMilestone(m) {
  if (!m || typeof m !== 'object') return null;
  return {
    id: String(m.id || ''),
    description: String(m.description || ''),
    amount: finiteNonNeg(m.amount),
    status: MILESTONE_STATUSES.includes(m.status) ? m.status : 'pending',
    proofHash: m.proofHash ? String(m.proofHash) : null,
    privateNote: m.privateNote != null ? String(m.privateNote) : null,
    deadline: finiteNonNeg(m.deadline),
  };
}

function normalizeAuditEntry(e) {
  if (!e || typeof e !== 'object') return null;
  return {
    seq: finiteNonNeg(e.seq),
    type: String(e.type || ''),
    actor: String(e.actor || ''),
    state: String(e.state || ''),
    data: e.data && typeof e.data === 'object' && !Array.isArray(e.data) ? e.data : {},
  };
}

export function normalizeEscrow(raw) {
  const base = freshEscrow();
  if (!raw || typeof raw !== 'object') return base;
  const milestones = Array.isArray(raw.milestones)
    ? raw.milestones.map(normalizeMilestone).filter((m) => m && m.id)
    : base.milestones;
  const resumeTo = raw.resumeTo === 'funded' || raw.resumeTo === 'in_progress' ? raw.resumeTo : null;
  return {
    state: ESCROW_STATES.includes(raw.state) ? raw.state : 'created',
    resumeTo,
    funded: finiteNonNeg(raw.funded),
    released: finiteNonNeg(raw.released),
    refunded: finiteNonNeg(raw.refunded),
    milestones: milestones.length ? milestones.slice(0, 8) : base.milestones,
    audit: Array.isArray(raw.audit)
      ? raw.audit.map(normalizeAuditEntry).filter(Boolean).slice(0, 200)
      : [],
  };
}

export function normalizeStudioState(raw) {
  const base = emptyStudioState();
  if (!raw || typeof raw !== 'object') return base;
  const escrowSrc = raw.escrow && typeof raw.escrow === 'object' ? raw.escrow : raw.state ? raw : null;
  const role = ['client', 'agent', 'approver'].includes(raw.activeRole) ? raw.activeRole : 'client';
  return {
    schemaVersion: SCHEMA_VERSION,
    escrow: normalizeEscrow(escrowSrc || {}),
    activeRole: role,
    updatedAt: raw.updatedAt || null,
  };
}

export function buildExportDocument(state, meta = {}) {
  const normalized = normalizeStudioState(state);
  return {
    kind: EXPORT_KIND,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lab: 'Midnight GrokBot Agent · Agent Escrow Studio',
    note: 'LOCAL educational snapshot — not on-chain. Private proof notes may be present; treat as sensitive.',
    donate: DONATE_ADDR,
    handle: '@kshot9000',
    ...meta,
    state: normalized,
  };
}

export function parseImportDocument(input) {
  let data = input;
  if (typeof input === 'string') {
    try {
      data = JSON.parse(input);
    } catch {
      return { ok: false, state: null, error: 'Invalid JSON' };
    }
  }
  if (!data || typeof data !== 'object') {
    return { ok: false, state: null, error: 'Import must be an object' };
  }
  const candidate =
    data.kind === EXPORT_KIND && data.state
      ? data.state
      : data.escrow || data.state
        ? data
        : null;
  if (!candidate) {
    return {
      ok: false,
      state: null,
      error: `Expected kind ${EXPORT_KIND} or a raw { escrow, activeRole } snapshot`,
    };
  }
  const state = normalizeStudioState(candidate);
  // Allow empty/fresh import only if wrapped export (reset-like) — require some signal
  if (!state.escrow && !state.activeRole) {
    return { ok: false, state: null, error: 'Import has no escrow payload' };
  }
  return { ok: true, state, error: null };
}
