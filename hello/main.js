/**
 * Hello Studio — local ZK prove metrics for hello.compact increment and recordNote.
 * recordNote is the disclose() witness path (local proof server :6300). LOCAL ≠ on-chain.
 */
import {
  parseLastProve,
  fetchLastProve,
  probeProveBridge,
  requestBridgeProveHello,
  summarizeProveStatus,
  formatBytes,
  formatMs,
  proveStepRows,
  PROVE_CLAIM,
  DEFAULT_BRIDGE_URL,
  DEFAULT_STATIC_URL,
} from './prove-metrics.mjs';

const DONATE_ADDR =
  'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';

const toastEl = document.getElementById('toast');
function showToast(msg, isErr = false) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.toggle('err', Boolean(isErr));
  toastEl.classList.add('is-show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('is-show'), 4200);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied donation address', false);
  } catch {
    showToast('Copy failed — select address manually', true);
  }
}

document.getElementById('copy-addr')?.addEventListener('click', () => copyText(DONATE_ADDR));
document.getElementById('dock-copy-addr')?.addEventListener('click', () => copyText(DONATE_ADDR));

const navToggle = document.getElementById('nav-toggle');
const siteHeader = document.getElementById('site-header');
navToggle?.addEventListener('click', () => {
  const open = siteHeader?.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});

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
  greetings: document.getElementById('proveGreetings'),
  noteCount: document.getElementById('proveNoteCount'),
  totalProof: document.getElementById('proveTotalProof'),
  totalMs: document.getElementById('proveTotalMs'),
  writtenAt: document.getElementById('proveWrittenAt'),
};

function renderProvePanel(report, meta = {}) {
  lastProveReport = report || null;
  const status = summarizeProveStatus(report, { studio: 'hello', ...meta });
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
  if (proveEl.path) proveEl.path.textContent = report.circuit || report.path || '—';
  if (proveEl.greetings) {
    proveEl.greetings.textContent = report.greetings
      ? `${report.greetings.before} → ${report.greetings.after}`
      : '—';
  }
  if (proveEl.noteCount) {
    proveEl.noteCount.textContent = report.noteCount
      ? `${report.noteCount.before} → ${report.noteCount.after}`
      : report.circuit === 'recordNote'
        ? 'missing'
        : '—';
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
        circuit: report.circuit,
        greetings: report.greetings,
        totals: report.totals,
        checkLen: report.checkLen,
        zkArtifacts: report.zkArtifacts,
        witness: report.witness,
        proofServer: report.proofServer,
      },
      null,
      2,
    );
  }
}

async function loadLastProveStatic() {
  showToast('Loading last-prove.json…', false);
  const r = await fetchLastProve(DEFAULT_STATIC_URL, {
    emptyHint: 'No last-prove.json yet — run prove:hello-local first',
  });
  if (!r.ok) {
    showToast(r.error || 'Load failed', true);
    renderProvePanel(null);
    return;
  }
  renderProvePanel(r.report, { sourceLabel: 'last-prove.json' });
  showToast(
    `Loaded ${r.report.circuit || 'hello'} · ${formatBytes(r.report.totals?.proofBytes)} · LOCAL ≠ chain`,
    false,
  );
}

async function loadLastProveBridge() {
  showToast('Fetching bridge /last-prove?contract=hello…', false);
  const r = await fetchLastProve(`${DEFAULT_BRIDGE_URL}/last-prove?contract=hello`);
  if (!r.ok) {
    showToast(r.error || 'Bridge load failed (soft-fail)', true);
    return;
  }
  renderProvePanel(r.report, { sourceLabel: 'prove-bridge :6399 · hello' });
  showToast(`Bridge loaded ${r.report.circuit || 'hello'}`, false);
}

async function doProbeBridge() {
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: probing…';
  const r = await probeProveBridge(DEFAULT_BRIDGE_URL);
  if (!r.ok) {
    if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: down';
    showToast('prove-bridge :6399 unreachable — npm run prove-bridge', true);
    return;
  }
  const helloExists = r.body?.helloLastProveExists ? 'hello last-prove' : 'no hello last-prove';
  const proof = r.body?.proofServer?.ok ? 'proof-server ok' : 'proof-server ?';
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = `bridge: up · ${helloExists}`;
  showToast(`prove-bridge up · ${helloExists} · ${proof}`, false);
}

async function doBridgeProveHello(circuit = 'increment') {
  const label = circuit === 'recordNote' ? 'recordNote (witness, disclose hash)' : 'increment';
  showToast(`Bridge proving hello ${label} (may take ~1–5s)…`, false);
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: proving…';
  const r = await requestBridgeProveHello(DEFAULT_BRIDGE_URL, { circuit });
  if (!r.ok) {
    if (proveEl.bridgePill) proveEl.bridgePill.textContent = 'bridge: prove failed';
    showToast(r.error || 'Bridge prove failed (soft-fail)', true);
    return;
  }
  if (proveEl.bridgePill) proveEl.bridgePill.textContent = `bridge: up · ${circuit}`;
  renderProvePanel(r.report, {
    sourceLabel: `bridge POST /prove?contract=hello&circuit=${circuit}`,
  });
  showToast(`hello ${circuit} proved via bridge — LOCAL ≠ on-chain`, false);
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
  doBridgeProveHello('increment').catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-bridge-prove-note')?.addEventListener('click', () => {
  doBridgeProveHello('recordNote').catch((e) => showToast(String(e?.message || e), true));
});
document.getElementById('btn-import-prove')?.addEventListener('click', () => {
  document.getElementById('prove-import-file')?.click();
});
document.getElementById('prove-import-file')?.addEventListener('change', (e) => {
  importProveFile(e.target?.files?.[0]);
  e.target.value = '';
});

renderProvePanel(null);

// Soft auto-probe bridge (no prove) so pill is honest on load.
doProbeBridge().catch(() => {});

void lastProveReport;
