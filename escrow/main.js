/**
 * Agent Escrow Studio — role theater + dual-state proofs (local-true).
 * Real localStorage persistence, multi-tab sync, export/import.
 * Optional local ZK prove metrics via last-prove.json / prove-bridge :6399.
 * Not Compact deploy. Not on-chain.
 */
import {
  MAIN_PATH,
  WHY_DISABLED,
  SUCCESS_MSG,
  ROLE_ACTS,
  PROOF_NOTES,
  DONATE_ADDR,
  balance,
  findMilestone,
  can,
  roleAllows,
  stateAllows,
  nextAction,
  applyAction,
  freshEscrow,
} from './escrow-core.mjs';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
} from './persist.mjs';
import {
  parseLastProve,
  fetchLastProve,
  probeProveBridge,
  requestBridgeProve,
  summarizeProveStatus,
  proveStepRows,
  formatBytes,
  formatMs,
  DEFAULT_BRIDGE_URL,
  DEFAULT_STATIC_URL,
  PROVE_CLAIM,
  ESCROW_BRIDGE_PATHS,
} from './prove-metrics.mjs';

const ROLE_HINTS = {
  client:
    'Acting as <strong>Client</strong> — fund / start / settle / dispute when state allows. Client is also an approver here.',
  agent:
    'Acting as <strong>Agent</strong> — submit proof hashes + private work notes. You cannot release your own milestones.',
  approver:
    'Acting as <strong>Approver</strong> — release or reject after a public proof exists. Private notes stay shielded.',
};

let s = freshEscrow();
/** @type {"client"|"agent"|"approver"} */
let activeRole = 'client';
let toastTimer = null;
let tabSync = null;
let applyingRemote = false;

const el = {
  statePill: document.getElementById('statePill'),
  funded: document.getElementById('funded'),
  released: document.getElementById('released'),
  refunded: document.getElementById('refunded'),
  balance: document.getElementById('balance'),
  miles: document.getElementById('miles'),
  log: document.getElementById('log'),
  err: document.getElementById('err'),
  toast: document.getElementById('toast'),
  nextHint: document.getElementById('nextHint'),
  disabledHelp: document.getElementById('disabledHelp'),
  stepper: document.getElementById('escrowStepper'),
  milestoneTrack: document.getElementById('milestoneTrack'),
  publicProofs: document.getElementById('publicProofs'),
  privateProofs: document.getElementById('privateProofs'),
  publicProofsEmpty: document.getElementById('publicProofsEmpty'),
  privateProofsEmpty: document.getElementById('privateProofsEmpty'),
  roleHint: document.getElementById('roleHint'),
};

function snapshotState() {
  return { escrow: s, activeRole };
}

function applyStudio(data, { announceRemote = false } = {}) {
  s = data?.escrow ? { ...data.escrow, milestones: (data.escrow.milestones || []).map((m) => ({ ...m })), audit: [...(data.escrow.audit || [])] } : freshEscrow();
  activeRole = ['client', 'agent', 'approver'].includes(data?.activeRole) ? data.activeRole : 'client';
  document.querySelectorAll('.role-card[data-role]').forEach((c) => {
    const on = c.getAttribute('data-role') === activeRole;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  if (announceRemote) showToast('Synced from another tab', false);
}

function save() {
  if (applyingRemote) return;
  const saved = saveStudioState(snapshotState());
  try {
    tabSync?.broadcast(saved);
  } catch (_) {}
}

function load() {
  applyStudio(loadStudioState());
}

function startTabSync() {
  tabSync?.stop();
  tabSync = createTabSync({
    onRemote(state) {
      applyingRemote = true;
      try {
        applyStudio(state, { announceRemote: true });
        render();
      } finally {
        applyingRemote = false;
      }
    },
  });
}

async function hashProof(milestoneId, note) {
  const payload = `agent-escrow:v1|${milestoneId}|${note}|${Date.now()}`;
  const dig = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return '0x' + [...new Uint8Array(dig)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function showErr(msg) {
  if (!el.err) return;
  if (!msg) {
    el.err.style.display = 'none';
    el.err.textContent = '';
    return;
  }
  el.err.style.display = 'block';
  el.err.textContent = msg;
}

function showToast(msg, isError) {
  if (!el.toast) return;
  el.toast.hidden = false;
  el.toast.textContent = msg;
  el.toast.classList.toggle('error-toast', !!isError);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.hidden = true;
  }, 2800);
}

function hintText() {
  const next = nextAction(s, activeRole);
  if (s.state === 'settled') return 'Escrow settled. Reset to walk the flow again.';
  if (s.state === 'refunded') return 'Escrow refunded after dispute. Reset to walk again.';
  if (s.state === 'disputed') return 'Disputed — resume work or refund the remaining balance.';
  if (!next) return 'No primary action right now — try Dispute or Reset.';
  const labels = {
    fund: 'Next: <strong>Fund 5 ADA</strong> to leave created.',
    start: 'Next: <strong>Start</strong> work once funded.',
    proof1: 'Next: Agent submits <strong>proof m1</strong>.',
    approve1: 'Next: Approver <strong>releases m1</strong>.',
    proof2: 'Next: Agent submits <strong>proof m2</strong>.',
    reject2: 'Next: Approver can <strong>reject m2</strong> (demo path) or you’d release in a real flow.',
    settle: 'Next: <strong>Settle</strong> — all milestones decided.',
    resume: 'Next: <strong>Resume</strong> after dispute.',
    refund: 'Next: <strong>Dispute refund</strong> remaining balance.',
  };
  return labels[next] || 'Continue with an enabled action.';
}

function updateButtons() {
  const next = nextAction(s, activeRole);
  document.querySelectorAll('[data-act]').forEach((btn) => {
    const act = btn.getAttribute('data-act');
    const enabled = can(s, activeRole, act);
    const roleOk = roleAllows(activeRole, act);
    const stateOk = stateAllows(s, act);
    btn.disabled = !enabled;
    btn.classList.toggle('cta-pulse', enabled && act === next && act !== 'reset');
    btn.classList.toggle('wrong-role', !roleOk && stateOk);
    btn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
    if (!enabled) {
      if (!roleOk) {
        btn.title = 'Switch role — this action belongs to another party.';
      } else {
        btn.title = WHY_DISABLED[act] || 'Not available in current state';
      }
    } else {
      btn.title = btn.getAttribute('data-label') || act;
    }
  });
  if (el.roleHint) el.roleHint.innerHTML = ROLE_HINTS[activeRole] || '';
}

function renderStepper() {
  if (!el.stepper) return;
  const steps = el.stepper.querySelectorAll('.step');
  let idx = MAIN_PATH.indexOf(s.state);
  if (s.state === 'disputed' || s.state === 'refunded') {
    idx = s.state === 'refunded' ? MAIN_PATH.indexOf('settled') : MAIN_PATH.indexOf('in_progress');
    if (s.funded === 0) idx = 0;
    else if (
      s.state === 'disputed' &&
      findMilestone(s, 'm1')?.status === 'pending' &&
      s.milestones.every((m) => m.status === 'pending')
    ) {
      const wasStarted = s.audit.some((e) => e.type === 'started');
      idx = wasStarted ? MAIN_PATH.indexOf('in_progress') : MAIN_PATH.indexOf('funded');
    }
  }
  if (idx < 0) idx = 0;

  const progressPct =
    s.state === 'settled' || s.state === 'refunded'
      ? 100
      : s.state === 'disputed'
        ? Math.max(0, (idx / (MAIN_PATH.length - 1)) * 100)
        : (idx / (MAIN_PATH.length - 1)) * 100;
  el.stepper.style.setProperty('--progress', progressPct + '%');

  steps.forEach((step) => {
    const st = step.getAttribute('data-state');
    const si = MAIN_PATH.indexOf(st);
    step.classList.remove('done', 'current');
    if (s.state === 'settled' && st === 'settled') {
      step.classList.add('current', 'done');
    } else if (s.state === st && MAIN_PATH.includes(s.state)) {
      step.classList.add('current');
    }
    if (
      si < idx ||
      (s.state === 'settled' && si <= idx) ||
      (s.state === 'refunded' && si < MAIN_PATH.length - 1 && si <= idx)
    ) {
      step.classList.add('done');
    }
    if (s.state === st && MAIN_PATH.includes(s.state)) {
      step.classList.add('current');
    }
  });

  document.querySelectorAll('.branch-chip').forEach((chip) => {
    const b = chip.getAttribute('data-branch');
    chip.classList.remove('active', 'done');
    if (b === 'disputed' && s.state === 'disputed') chip.classList.add('active');
    if (b === 'refunded' && s.state === 'refunded') chip.classList.add('done', 'active');
    if (b === 'disputed' && s.state === 'refunded') chip.classList.add('done');
  });
}

function milestoneWidth(status) {
  if (status === 'pending') return '8%';
  if (status === 'proof_submitted') return '55%';
  return '100%';
}

function renderMilestones() {
  if (!el.milestoneTrack) return;
  el.milestoneTrack.innerHTML = s.milestones
    .map((m) => {
      const cls = ['m-card', m.status];
      if (m.status === 'proof_submitted' || m.status === 'pending') cls.push('active');
      return (
        `<article class="${cls.join(' ')}">` +
        `<div class="m-card-top"><span class="m-id">${m.id}</span>` +
        `<span class="status-tag ${m.status}">${m.status}</span></div>` +
        `<p class="m-desc">${m.description} · ${m.amount} L</p>` +
        `<div class="m-bar" aria-hidden="true"><span style="--w:${milestoneWidth(m.status)}"></span></div>` +
        `</article>`
      );
    })
    .join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderProofs() {
  if (!el.publicProofs || !el.privateProofs) return;
  const withProof = s.milestones.filter((m) => m.proofHash);
  el.publicProofs.innerHTML = '';
  el.privateProofs.innerHTML = '';
  if (el.publicProofsEmpty) el.publicProofsEmpty.hidden = withProof.length > 0;
  if (el.privateProofsEmpty) el.privateProofsEmpty.hidden = withProof.length > 0;

  withProof.forEach((m) => {
    const pub = document.createElement('li');
    pub.className = 'proof-card';
    pub.innerHTML =
      `<div class="meta"><span class="tag sealed">${escapeHtml(m.id)}</span>` +
      `<span class="status-tag ${m.status}">${escapeHtml(m.status)}</span></div>` +
      `<div class="commitment mono">H = ${escapeHtml(m.proofHash)}</div>` +
      `<p class="body muted">Body sealed — commitment only (approver sees this).</p>`;
    el.publicProofs.appendChild(pub);

    const priv = document.createElement('li');
    priv.className = 'proof-card';
    priv.innerHTML =
      `<div class="meta"><span class="tag sealed">vault · ${escapeHtml(m.id)}</span></div>` +
      `<p class="body">${escapeHtml(m.privateNote || '(no note)')}</p>` +
      `<div class="commitment mono">H = ${escapeHtml(m.proofHash)}</div>`;
    el.privateProofs.appendChild(priv);
  });
}

function render() {
  if (!el.statePill) return;
  el.statePill.textContent = s.state;
  el.statePill.className =
    'pill' +
    (s.state === 'settled' || s.state === 'refunded'
      ? ' ok'
      : s.state === 'disputed'
        ? ' warn'
        : s.state === 'in_progress' || s.state === 'funded'
          ? ' live'
          : '');
  el.funded.textContent = String(s.funded);
  el.released.textContent = String(s.released);
  el.refunded.textContent = String(s.refunded);
  el.balance.textContent = String(balance(s));
  el.miles.innerHTML = s.milestones
    .map(
      (m) =>
        `<tr><td><code>${m.id}</code></td><td>${m.description}</td><td>${m.amount}</td>` +
        `<td><span class="status-tag ${m.status}">${m.status}</span></td>` +
        `<td><code>${m.proofHash || '—'}</code></td></tr>`,
    )
    .join('');
  el.log.textContent = s.audit.length
    ? s.audit
        .map((e) => `#${e.seq} ${e.type} by ${e.actor} → ${e.state} ${JSON.stringify(e.data)}`)
        .join('\n')
    : '(empty)';
  if (el.nextHint) el.nextHint.innerHTML = hintText();
  renderStepper();
  renderMilestones();
  renderProofs();
  updateButtons();
}

async function runAct(act) {
  if (!roleAllows(activeRole, act)) {
    throw new Error('Wrong role — switch the role theater to use this action.');
  }
  let payload = {};
  if (act === 'proof1' || act === 'proof2') {
    const id = act === 'proof1' ? 'm1' : 'm2';
    const note = PROOF_NOTES[id];
    payload = { privateNote: note, proofHash: await hashProof(id, note) };
  }
  if (act === 'reset') {
    if (!window.confirm('Reset Agent Escrow Studio? Clears localStorage for this app.')) return;
    clearStudioState();
    const result = applyAction(freshEscrow(), 'reset');
    s = result.escrow;
    save();
    render();
    showToast(SUCCESS_MSG.reset, false);
    return;
  }
  const result = applyAction(s, act, payload);
  if (!result.ok) throw new Error(result.error || 'Action failed');
  s = result.escrow;
  save();
  render();
  showToast(SUCCESS_MSG[act] || 'Done (local-true).', false);
}

function exportStudio() {
  const json = exportStudioJSON(snapshotState());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `agent-escrow-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Exported JSON snapshot', false);
}

async function importStudioFromFile(file) {
  if (!file) return;
  const text = await file.text();
  const result = importStudioJSON(text);
  if (!result.ok) {
    showToast(result.error || 'Import failed', true);
    return;
  }
  if (!window.confirm("Import replaces this tab's Agent Escrow data. Continue?")) return;
  applyingRemote = true;
  try {
    applyStudio(result.state);
    saveStudioState(snapshotState());
    tabSync?.broadcast(snapshotState());
  } finally {
    applyingRemote = false;
  }
  render();
  showToast('Import applied — still LOCAL educational data, not on-chain.', false);
}

document.querySelectorAll('[data-act]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const act = btn.getAttribute('data-act');
    try {
      showErr('');
      await runAct(act);
    } catch (e) {
      const msg = e.message || String(e);
      showErr(msg);
      showToast(msg, true);
    }
  });
  const helpFor = (btnEl) => {
    if (!el.disabledHelp) return;
    const act = btnEl.getAttribute('data-act');
    if (!btnEl.disabled) {
      el.disabledHelp.textContent = '';
      return;
    }
    if (!roleAllows(activeRole, act)) {
      el.disabledHelp.textContent = 'Switch role — this action belongs to another party.';
    } else {
      el.disabledHelp.textContent = WHY_DISABLED[act] || 'Not available.';
    }
  };
  btn.addEventListener('mouseenter', () => helpFor(btn));
  btn.addEventListener('focus', () => helpFor(btn));
});

document.querySelectorAll('.role-card[data-role]').forEach((card) => {
  card.addEventListener('click', () => {
    activeRole = card.getAttribute('data-role') || 'client';
    document.querySelectorAll('.role-card[data-role]').forEach((c) => {
      const on = c.getAttribute('data-role') === activeRole;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    save();
    updateButtons();
    showToast('Now acting as ' + activeRole, false);
  });
});

document.getElementById('btn-export')?.addEventListener('click', exportStudio);
document.getElementById('btn-import')?.addEventListener('click', () => {
  document.getElementById('import-file')?.click();
});
document.getElementById('import-file')?.addEventListener('change', (e) => {
  const file = e.target?.files?.[0];
  importStudioFromFile(file).catch(console.error);
  e.target.value = '';
});

const dockCopy = document.getElementById('dock-copy-addr');
if (dockCopy) {
  dockCopy.addEventListener('click', async () => {
    const addr =
      (document.getElementById('donation-addr')?.textContent || '').trim() || DONATE_ADDR;
    try {
      await navigator.clipboard.writeText(addr);
      showToast('ADA address copied · @kshot9000', false);
    } catch {
      showToast('Copy failed — select address manually', true);
    }
  });
}

const copyAddr = document.getElementById('copy-addr');
const donationAddr = document.getElementById('donation-addr');
if (donationAddr) donationAddr.textContent = DONATE_ADDR;
if (copyAddr && donationAddr) {
  copyAddr.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(donationAddr.textContent.trim());
      const prev = copyAddr.textContent;
      copyAddr.textContent = 'Copied';
      setTimeout(() => {
        copyAddr.textContent = prev;
      }, 1600);
    } catch {
      copyAddr.textContent = 'Select & copy';
    }
  });
}

const header = document.getElementById('site-header');
const toggle = document.getElementById('nav-toggle');
const nav = document.getElementById('site-nav');
if (header && toggle && nav) {
  const closeNav = () => {
    header.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.textContent = '☰';
  };
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.textContent = open ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

// silence unused import lint for ROLE_ACTS / ROLE_HINTS_HTML if tree-shaken
void ROLE_ACTS;


/* —— Local ZK prove metrics panel (REAL CLI / bridge — still NOT on-chain) —— */
let lastProveReport = null;

const proveEl = {
  pill: document.getElementById('proveStatusPill'),
  label: document.getElementById('proveStatusLabel'),
  detail: document.getElementById('proveStatusDetail'),
  claim: document.getElementById('proveHonestClaim'),
  bridgePill: document.getElementById('proveBridgePill'),
  summary: document.getElementById('proveSummary'),
  tableWrap: document.getElementById('proveTableWrap'),
  body: document.getElementById('proveStepsBody'),
  raw: document.getElementById('proveRaw'),
  path: document.getElementById('provePath'),
  steps: document.getElementById('proveSteps'),
  totalProof: document.getElementById('proveTotalProof'),
  totalMs: document.getElementById('proveTotalMs'),
  writtenAt: document.getElementById('proveWrittenAt'),
};

function renderProvePanel(report, meta = {}) {
  lastProveReport = report || null;
  const status = summarizeProveStatus(report, { studio: 'escrow', ...meta });
  if (proveEl.pill) {
    proveEl.pill.textContent = status.state;
    proveEl.pill.className = 'pill ' + (status.state === 'loaded' ? 'ok' : 'warn');
  }
  if (proveEl.label) proveEl.label.textContent = status.label;
  if (proveEl.detail) proveEl.detail.textContent = status.detail;
  if (proveEl.claim) proveEl.claim.textContent = status.honest || PROVE_CLAIM;

  if (!report) {
    if (proveEl.summary) proveEl.summary.hidden = true;
    if (proveEl.tableWrap) proveEl.tableWrap.hidden = true;
    if (proveEl.raw) {
      proveEl.raw.hidden = true;
      proveEl.raw.textContent = '';
    }
    return;
  }

  if (proveEl.summary) proveEl.summary.hidden = false;
  if (proveEl.path) proveEl.path.textContent = report.path || '—';
  if (proveEl.steps) {
    proveEl.steps.textContent =
      report.kind === 'escrow-local-prove-all'
        ? `${report.coveredCount}/${report.expectedImpure}`
        : String(report.stepCount ?? '—');
  }
  if (proveEl.totalProof) proveEl.totalProof.textContent = formatBytes(report.totals?.proofBytes);
  if (proveEl.totalMs) proveEl.totalMs.textContent = formatMs(report.totals?.proveMs);
  if (proveEl.writtenAt) {
    const w = report.writtenAt;
    proveEl.writtenAt.textContent = w ? String(w).replace('T', ' ').replace(/\.\d+Z$/, 'Z') : '—';
  }

  const rows = proveStepRows(report);
  if (proveEl.tableWrap && proveEl.body) {
    if (rows.length) {
      proveEl.tableWrap.hidden = false;
      proveEl.body.innerHTML = rows
        .map(
          (r) =>
            `<tr><td><code>${escapeHtml(r.circuit)}</code></td><td>${escapeHtml(r.role)}</td>` +
            `<td>${escapeHtml(r.preimage)}</td><td>${escapeHtml(r.proof)}</td>` +
            `<td>${escapeHtml(r.ms)}</td><td>${escapeHtml(r.state)}</td></tr>`,
        )
        .join('');
    } else if (report.kind === 'escrow-local-prove-all' && report.paths?.length) {
      proveEl.tableWrap.hidden = false;
      proveEl.body.innerHTML = report.paths
        .map(
          (p) =>
            `<tr><td colspan="2"><code>${escapeHtml(p.path)}</code></td>` +
            `<td colspan="2">${escapeHtml((p.circuitsProved || []).join(' → '))}</td>` +
            `<td>${escapeHtml(formatMs(p.totalProveMs))}</td><td>${p.stepCount}</td></tr>`,
        )
        .join('');
    } else {
      proveEl.tableWrap.hidden = true;
      proveEl.body.innerHTML = '';
    }
  }

  if (proveEl.raw) {
    proveEl.raw.hidden = false;
    proveEl.raw.textContent = JSON.stringify(
      {
        claim: report.claim,
        path: report.path,
        stepCount: report.stepCount,
        totals: report.totals,
        circuitsProved: report.circuitsProved,
        witness: report.witness,
        coveredCount: report.coveredCount,
        allImpureCovered: report.allImpureCovered,
      },
      null,
      2,
    );
  }
}

async function loadLastProveStatic() {
  showToast('Loading last-prove.json…', false);
  const r = await fetchLastProve(DEFAULT_STATIC_URL, {
    emptyHint: 'No last-prove.json yet — run prove:escrow-local first',
  });
  if (!r.ok) {
    showToast(r.error || 'Load failed', true);
    renderProvePanel(null);
    return;
  }
  renderProvePanel(r.report, { sourceLabel: 'last-prove.json' });
  showToast(`Loaded path=${r.report.path} · ${r.report.stepCount || r.report.coveredCount} · LOCAL ≠ chain`, false);
}

async function loadLastProveBridge() {
  showToast('Fetching bridge /last-prove…', false);
  const r = await fetchLastProve(`${DEFAULT_BRIDGE_URL}/last-prove`);
  if (!r.ok) {
    showToast(r.error || 'Bridge load failed', true);
    return;
  }
  renderProvePanel(r.report, { sourceLabel: 'prove-bridge :6399' });
  showToast(`Bridge loaded path=${r.report.path}`, false);
}

async function doProbeBridge() {
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: probing…';
  const r = await probeProveBridge(DEFAULT_BRIDGE_URL);
  if (!r.ok) {
    if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: down';
    showToast('prove-bridge :6399 unreachable — npm run prove-bridge', true);
    return;
  }
  const exists = r.body?.lastProveExists ? 'has last-prove' : 'no last-prove yet';
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = `bridge: up · ${exists}`;
  showToast(`prove-bridge up · ${exists}`, false);
}

function selectedEscrowProvePath() {
  const sel = document.getElementById('prove-path-select');
  const v = sel?.value || 'initialize';
  return ESCROW_BRIDGE_PATHS.includes(v) ? v : 'initialize';
}

async function doBridgeProve() {
  const pathName = selectedEscrowProvePath();
  const slow = pathName === 'all' || pathName === 'happy';
  showToast(
    `Bridge proving path=${pathName}${slow ? ' (may take longer)' : ' (may take ~1–3s)'}…`,
    false,
  );
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = `bridge: proving ${pathName}…`;
  const r = await requestBridgeProve(DEFAULT_BRIDGE_URL, { path: pathName, contract: 'escrow' });
  if (!r.ok) {
    if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: prove failed';
    showToast(r.error || 'Bridge prove failed (soft-fail)', true);
    return;
  }
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = `bridge: up · proved ${pathName}`;
  renderProvePanel(r.report, { sourceLabel: `bridge POST /prove?path=${pathName}` });
  showToast(`path=${pathName} proved via bridge — LOCAL ≠ on-chain`, false);
}

function importProveFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parseLastProve(String(reader.result || ''));
    if (!parsed.ok) {
      showToast(parsed.error || 'Invalid prove JSON', true);
      return;
    }
    renderProvePanel(parsed.report, { sourceLabel: 'import' });
    showToast('Imported prove JSON · LOCAL ≠ on-chain', false);
  };
  reader.onerror = () => showToast('Could not read file', true);
  reader.readAsText(file);
}

document.getElementById('btn-load-last-prove')?.addEventListener('click', () => {
  loadLastProveStatic().catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-probe-bridge')?.addEventListener('click', () => {
  doProbeBridge().catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-bridge-last')?.addEventListener('click', () => {
  loadLastProveBridge().catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-bridge-prove')?.addEventListener('click', () => {
  doBridgeProve().catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-import-prove')?.addEventListener('click', () => {
  document.getElementById('prove-import-file')?.click();
});
document.getElementById('prove-import-file')?.addEventListener('change', (e) => {
  importProveFile(e.target?.files?.[0]);
  e.target.value = '';
});


renderProvePanel(null);
load();
startTabSync();
render();
