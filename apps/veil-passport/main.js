/**
 * Veil Passport Studio — LOCAL-TRUE persistence.
 * Real localStorage, multi-tab sync, export/import.
 * Not Compact. Not on-chain. Not Pages-live.
 */
import {
  DONATE_ADDR,
  DOMAIN,
  CLAIM_KEYS,
  CLAIM_LABELS,
  short,
  escapeHtml,
  claimCommitPayload,
  phaseOf,
} from './passport-core.mjs';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
} from './persist.mjs';


/** @type {null | {
 *  id: string, displayName: string, age: number, role: string, membership: string, region: string,
 *  salt: string, holderSecret: string, commit: string, issuerSig: string, issuedAt: string,
 *  presented: boolean, revoked: boolean, revokeNullifier?: string,
 *  disclosed: string[], lastPredicate?: {kind:string, detail:string, ok:boolean, pi:string},
 *  verified?: boolean
 * }} */
let active = null;
/** @type {typeof active[]} */
let passports = [];
let proving = false;
let toastTimer = 0;
let selectedPred = "age";

function randomHex(bytes = 16) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function sleep(ms) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return new Promise((r) => setTimeout(r, reduced ? Math.min(ms, 80) : ms));
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove("is-show"), 2400);
}

function announce(msg) {
  const live = document.getElementById("live-region");
  if (live) live.textContent = msg;
}

function setStatus(id, msg, kind) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = "status" + (kind ? " " + kind : "");
}

function logTo(id, line) {
  const el = document.getElementById(id);
  if (!el) return;
  const t = new Date().toLocaleTimeString("en-US", { hour12: false });
  const idle = el.textContent.startsWith("Awaiting");
  const prev = idle ? "" : el.textContent + "\n";
  el.textContent = prev + `[${t}] ${line}`;
  el.scrollTop = el.scrollHeight;
}

let tabSync = null;
let applyingRemote = false;

function snapshotState() {
  return { passports, activeId: active?.id || null };
}

function applyStudio(data, { announceRemote = false } = {}) {
  passports = Array.isArray(data?.passports) ? data.passports : [];
  const aid = data?.activeId || null;
  active = passports.find((p) => p.id === aid) || passports[0] || null;
  if (announceRemote) {
    toast('Synced from another tab');
    announce('Synced from another tab');
  }
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
        refreshAll();
      } finally {
        applyingRemote = false;
      }
    },
  });
}

function exportStudio() {
  const json = exportStudioJSON(snapshotState());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `veil-passport-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('Exported JSON snapshot');
  announce('Studio exported as JSON');
}

async function importStudioFromFile(file) {
  if (!file) return;
  const text = await file.text();
  const result = importStudioJSON(text);
  if (!result.ok) {
    toast(result.error || 'Import failed');
    return;
  }
  if (!window.confirm("Import replaces this tab's Veil Passport data. Continue?")) return;
  applyingRemote = true;
  try {
    applyStudio(result.state);
    saveStudioState(snapshotState());
    tabSync?.broadcast(snapshotState());
  } finally {
    applyingRemote = false;
  }
  refreshAll();
  toast('Import applied — LOCAL educational data, not on-chain.');
  announce('Passport studio imported');
}


function setJourney(phase) {
  const steps = document.querySelectorAll("#journey-steps .journey-step");
  const order = ["idle", "issued", "presented", "proven", "revoked"];
  const idx = order.indexOf(phase);
  steps.forEach((li) => {
    const p = li.getAttribute("data-phase");
    const i = order.indexOf(p);
    li.classList.remove("is-active", "is-done");
    li.removeAttribute("aria-current");
    if (i < idx) li.classList.add("is-done");
    if (p === phase) {
      li.classList.add("is-active");
      li.setAttribute("aria-current", "step");
    }
  });
  const live = document.getElementById("journey-live");
  const labels = {
    idle: "Phase: idle — issue a passport to begin.",
    issued: "Phase: issued — commit + issuer sig sealed (local).",
    presented: "Phase: presented — verifier sees public surface only.",
    proven: "Phase: proven — selective disclose and/or predicate π.",
    revoked: "Phase: revoked — nullifier burned; presentations fail.",
  };
  if (live) live.textContent = labels[phase] || labels.idle;
}

function updateRails() {
  const veilMeter = document.getElementById("rail-veil");
  const pubMeter = document.getElementById("rail-public");
  const veilLabel = document.getElementById("rail-veil-label");
  const pubLabel = document.getElementById("rail-public-label");
  if (!active) {
    if (veilMeter) {
      veilMeter.setAttribute("aria-valuenow", "100");
      veilMeter.querySelector(".rail-fill").style.width = "100%";
    }
    if (pubMeter) {
      pubMeter.setAttribute("aria-valuenow", "0");
      pubMeter.querySelector(".rail-fill").style.width = "0%";
    }
    if (veilLabel) veilLabel.textContent = "100% veiled (no passport)";
    if (pubLabel) pubLabel.textContent = "0% public surface";
    return;
  }
  const total = CLAIM_KEYS.filter((k) => {
    if (k === "region") return !!(active.region && active.region.trim());
    return true;
  }).length;
  const disclosed = (active.disclosed || []).filter((k) => CLAIM_KEYS.includes(k));
  const discN = disclosed.length;
  let veil = total ? Math.round(((total - discN) / total) * 100) : 100;
  let pub = total ? Math.round((discN / total) * 100) : 0;
  if (active.presented) pub = Math.max(pub, 15);
  if (active.lastPredicate) pub = Math.max(pub, pub + 10);
  if (active.revoked) {
    veil = Math.min(veil, 40);
    pub = Math.max(pub, 55);
  }
  pub = Math.min(100, pub);
  veil = Math.max(0, Math.min(100, veil));
  if (veilMeter) {
    veilMeter.setAttribute("aria-valuenow", String(veil));
    veilMeter.querySelector(".rail-fill").style.width = veil + "%";
  }
  if (pubMeter) {
    pubMeter.setAttribute("aria-valuenow", String(pub));
    pubMeter.querySelector(".rail-fill").style.width = pub + "%";
  }
  if (veilLabel) {
    veilLabel.textContent =
      discN === 0
        ? "100% veiled (no disclose)"
        : `${veil}% veiled · ${discN}/${total} claims open`;
  }
  if (pubLabel) {
    pubLabel.textContent =
      pub === 0
        ? "0% public surface"
        : `${pub}% public surface` +
          (active.lastPredicate ? " · predicate shown" : "") +
          (active.revoked ? " · revoked" : "");
  }
}

function claimValue(p, key) {
  if (key === "displayName") return p.displayName;
  if (key === "age") return String(p.age);
  if (key === "role") return p.role;
  if (key === "membership") return p.membership;
  if (key === "region") return p.region || "—";
  return "—";
}

function renderPassportCard() {
  const statusEl = document.getElementById("pp-status");
  const fields = document.getElementById("pp-fields");
  const commitEl = document.getElementById("pp-commit");
  if (!active) {
    if (statusEl) {
      statusEl.textContent = "Idle";
      statusEl.className = "pp-status-pill is-idle";
    }
    if (fields) {
      fields.innerHTML =
        '<p class="muted small" style="margin:0">Issue a passport to seal claims into a commitment. Fields stay veiled until selective disclose.</p>';
    }
    if (commitEl) commitEl.textContent = "commit: —";
    return;
  }
  const phase = phaseOf(active);
  if (statusEl) {
    statusEl.textContent = phase;
    statusEl.className =
      "pp-status-pill" +
      (active.revoked ? " is-revoked" : phase === "idle" ? " is-idle" : "");
  }
  const disclosed = new Set(active.disclosed || []);
  const rows = CLAIM_KEYS.filter((k) => k !== "region" || (active.region && active.region.trim()))
    .map((k) => {
      const open = disclosed.has(k);
      const val = open
        ? `<span class="val revealed">${escapeHtml(claimValue(active, k))}</span>`
        : `<span class="val veiled">••••••••</span>`;
      return `<div class="pp-field-row"><span class="lbl">${CLAIM_LABELS[k]}</span>${val}</div>`;
    })
    .join("");
  if (fields) fields.innerHTML = rows;
  if (commitEl) {
    commitEl.textContent =
      "commit: " +
      short(active.commit, 12) +
      " · sig: " +
      short(active.issuerSig, 8) +
      (active.revokeNullifier ? " · null: " + short(active.revokeNullifier, 6) : "");
  }
}

function renderVerifier() {
  const el = document.getElementById("verifier-view");
  if (!el) return;
  if (!active) {
    el.innerHTML =
      "<strong>Waiting for presentation</strong> Issue and present a passport. The verifier sees commit + issuer stamp — not vault claims — until you disclose or prove.";
    return;
  }
  if (!active.presented && !active.revoked) {
    el.innerHTML =
      "<strong>Credential sealed (not presented)</strong> Commit exists locally. Press Present to show the public surface to a simulated verifier.";
    return;
  }
  const disclosed = active.disclosed || [];
  let html = `<strong>${active.revoked ? "REVOKED credential" : "Presented credential"}</strong>`;
  html += `<div class="mono" style="margin-top:0.45rem">commit ${short(active.commit, 14)}</div>`;
  html += `<div class="mono">issuerSig ${short(active.issuerSig, 10)}</div>`;
  if (disclosed.length) {
    html += `<div style="margin-top:0.55rem"><em>Disclosed:</em> `;
    html += disclosed
      .map((k) => `${CLAIM_LABELS[k]}=${escapeHtml(claimValue(active, k))}`)
      .join(" · ");
    html += `</div>`;
  } else {
    html += `<div style="margin-top:0.55rem" class="muted small">No claims disclosed — veil intact.</div>`;
  }
  if (active.lastPredicate) {
    const pr = active.lastPredicate;
    html += `<div style="margin-top:0.55rem"><em>Predicate:</em> ${escapeHtml(pr.detail)} → <strong style="color:${pr.ok ? "var(--ok)" : "var(--danger)"}">${pr.ok ? "PASS" : "FAIL"}</strong></div>`;
    html += `<div class="mono">π ${short(pr.pi, 12)}</div>`;
  }
  if (active.revokeNullifier) {
    html += `<div class="mono" style="margin-top:0.45rem;color:var(--danger)">nullifier ${short(active.revokeNullifier, 10)}</div>`;
  }
  el.innerHTML = html;
}

function updateButtons() {
  const has = !!active;
  const revoked = !!(active && active.revoked);
  const set = (id, disabled) => {
    const b = document.getElementById(id);
    if (b) b.disabled = disabled;
  };
  set("btn-present", !has || revoked);
  set("btn-disclose", !has || revoked);
  set("btn-veil-all", !has || revoked);
  set("btn-overdisclose", !has || revoked);
  set("btn-prove", !has || revoked || proving);
  set("btn-verify", !has || !active.presented);
  set("btn-tamper", !has || !active.lastPredicate || revoked);
  set("btn-revoke", !has || revoked);
}

function updateStats() {
  const issued = passports.length;
  const presented = passports.filter((p) => p.presented).length;
  const proven = passports.filter((p) => p.lastPredicate || (p.disclosed && p.disclosed.length)).length;
  const revoked = passports.filter((p) => p.revoked).length;
  const map = {
    "stat-issued": issued,
    "stat-presented": presented,
    "stat-proven": proven,
    "stat-revoked": revoked,
  };
  for (const [id, v] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(v);
  }
}

function renderBoard() {
  const list = document.getElementById("passport-list");
  if (!list) return;
  if (!passports.length) {
    list.innerHTML = '<li class="empty">No passports yet — issue or seed a demo.</li>';
    return;
  }
  list.innerHTML = passports
    .map((p) => {
      const activeCls = active && active.id === p.id ? " is-active" : "";
      const disc = (p.disclosed || []).length;
      return `<li class="pledge-item${activeCls}" data-id="${p.id}">
        <div class="pledge-main">
          <strong>${escapeHtml(p.displayName || "Passport")}</strong>
          <span class="muted small">${phaseOf(p)} · ${short(p.commit, 8)} · disclosed ${disc}</span>
        </div>
        <div class="btn-row">
          <button type="button" class="btn ghost small" data-act="select">Select</button>
        </div>
      </li>`;
    })
    .join("");
}

function refreshAll() {
  setJourney(phaseOf(active));
  renderPassportCard();
  renderVerifier();
  updateRails();
  updateButtons();
  updateStats();
  renderBoard();
  syncDiscloseChips();
}

function syncDiscloseChips() {
  const disclosed = new Set((active && active.disclosed) || []);
  document.querySelectorAll("#disclose-chips .claim-chip").forEach((lab) => {
    const key = lab.getAttribute("data-claim");
    const input = lab.querySelector("input");
    if (!input) return;
    input.checked = disclosed.has(key);
    lab.classList.toggle("is-on", input.checked);
    lab.classList.toggle("is-revealed", input.checked);
    lab.classList.toggle("is-veiled", !input.checked);
  });
}

async function buildCommit(claims, salt) {
  return sha256(claimCommitPayload(claims, salt));
}

async function issuePassport(opts = {}) {
  const displayName =
    opts.displayName ||
    document.getElementById("claim-name")?.value.trim() ||
    "";
  const ageRaw = opts.age != null ? opts.age : document.getElementById("claim-age")?.value;
  const age = Number(ageRaw);
  const role = opts.role || document.getElementById("claim-role")?.value || "builder";
  const membership =
    opts.membership || document.getElementById("claim-membership")?.value || "night";
  const region =
    opts.region != null
      ? opts.region
      : document.getElementById("claim-region")?.value.trim() || "";
  let salt = opts.salt || document.getElementById("claim-salt")?.value.trim() || "";
  let holderSecret =
    opts.holderSecret || document.getElementById("holder-secret")?.value.trim() || "";

  if (!displayName) {
    setStatus("issue-status", "Display name required.", "fail");
    toast("Name required");
    return null;
  }
  if (!Number.isFinite(age) || age < 1 || age > 120) {
    setStatus("issue-status", "Age must be 1–120.", "fail");
    toast("Invalid age");
    return null;
  }
  if (!salt) {
    salt = randomHex(16);
    const el = document.getElementById("claim-salt");
    if (el) el.value = salt;
  }
  if (!holderSecret) {
    holderSecret = randomHex(12);
    const el = document.getElementById("holder-secret");
    if (el) el.value = holderSecret;
  }

  const commit = await buildCommit(
    { displayName, age, role, membership, region },
    salt
  );
  const issuerSig = await sha256(`${DOMAIN}|issuer|${commit}|${randomHex(8)}`);
  const p = {
    id: "pp_" + randomHex(6),
    displayName,
    age,
    role,
    membership,
    region,
    salt,
    holderSecret,
    commit,
    issuerSig,
    issuedAt: new Date().toISOString(),
    presented: false,
    revoked: false,
    disclosed: [],
  };
  passports.unshift(p);
  active = p;
  save();
  setStatus(
    "issue-status",
    `Issued ${short(commit, 10)} · LOCAL-TRUE seal complete.`,
    "ok"
  );
  toast("Passport issued");
  announce("Passport issued and sealed locally");
  refreshAll();
  return p;
}

function presentPassport() {
  if (!active || active.revoked) return;
  active.presented = true;
  // sync array ref
  const i = passports.findIndex((p) => p.id === active.id);
  if (i >= 0) passports[i] = active;
  save();
  setStatus("issue-status", "Presented to simulated verifier.", "ok");
  toast("Presented (public surface)");
  announce("Passport presented");
  refreshAll();
}

async function runDisclose(keys, { warn = false } = {}) {
  if (!active || active.revoked) return;
  const stages = ["bind", "open", "keep", "surface"];
  const reset = () => {
    document.querySelectorAll("#disclose-stages li").forEach((li) => {
      li.classList.remove("is-active", "is-done", "is-fail");
      const m = li.querySelector("[data-stage-meta]");
      if (m) m.textContent = "—";
    });
  };
  reset();
  const mark = (stage, state, meta) => {
    const li = document.querySelector(`#disclose-stages li[data-stage="${stage}"]`);
    if (!li) return;
    li.classList.remove("is-active", "is-done", "is-fail");
    li.classList.add(state === "fail" ? "is-fail" : state === "active" ? "is-active" : "is-done");
    const m = li.querySelector("[data-stage-meta]");
    if (m && meta) m.textContent = meta;
  };

  logTo("disclose-log", warn ? "WARN path: over-disclose all claims…" : `Disclose set: [${keys.join(", ") || "∅"}]`);
  mark("bind", "active", keys.length + " keys");
  await sleep(280);
  mark("bind", "done", keys.join(",") || "none");

  mark("open", "active", "opening…");
  await sleep(320);
  active.disclosed = keys.slice();
  mark("open", "done", keys.length + " open");

  const veiled = CLAIM_KEYS.filter((k) => !keys.includes(k));
  mark("keep", "active", "veil…");
  await sleep(260);
  mark("keep", "done", veiled.length + " veiled");

  if (!active.presented) active.presented = true;
  mark("surface", "active", "rails…");
  await sleep(220);
  mark("surface", warn ? "fail" : "done", warn ? "OVER" : "ok");

  const i = passports.findIndex((p) => p.id === active.id);
  if (i >= 0) passports[i] = active;
  save();
  refreshAll();

  if (warn) {
    setStatus(
      "disclose-status",
      "Over-disclose: every claim opened — privacy rail collapsed (teaching warn).",
      "warn"
    );
    toast("Over-disclose warn");
    announce("Warning: all claims disclosed");
  } else {
    setStatus(
      "disclose-status",
      keys.length
        ? `Disclosed ${keys.length} claim(s); rest remain veiled.`
        : "All claims veiled.",
      "ok"
    );
    toast(keys.length ? "Disclosure applied" : "Fully veiled");
    announce("Selective disclosure updated");
  }
}

async function runPredicate() {
  if (!active || active.revoked || proving) return;
  proving = true;
  updateButtons();

  const stages = ["witness", "gate", "bind-commit", "prove"];
  document.querySelectorAll("#pred-stages li").forEach((li) => {
    li.classList.remove("is-active", "is-done", "is-fail");
    const m = li.querySelector("[data-stage-meta]");
    if (m) m.textContent = "—";
  });
  const mark = (stage, state, meta) => {
    const li = document.querySelector(`#pred-stages li[data-stage="${stage}"]`);
    if (!li) return;
    li.classList.remove("is-active", "is-done", "is-fail");
    li.classList.add(state === "fail" ? "is-fail" : state === "active" ? "is-active" : "is-done");
    const m = li.querySelector("[data-stage-meta]");
    if (m && meta) m.textContent = meta;
  };
  const setMeter = (pct, label) => {
    const fill = document.getElementById("pred-meter-fill");
    const meter = document.getElementById("pred-meter");
    const lab = document.getElementById("pred-meter-label");
    if (fill) fill.style.width = pct + "%";
    if (meter) meter.setAttribute("aria-valuenow", String(pct));
    if (lab) lab.textContent = label;
  };

  const card = document.getElementById("pred-result-card");
  const title = document.getElementById("pred-result-title");
  const hash = document.getElementById("pred-result-hash");
  const note = document.getElementById("pred-result-note");

  try {
    setMeter(8, "8% — loading witness");
    mark("witness", "active", "local");
    logTo("pred-log", `Witness load for ${selectedPred}…`);
    await sleep(350);
    mark("witness", "done", "ok");

    let ok = false;
    let detail = "";
    if (selectedPred === "age") {
      const thr = Number(document.getElementById("pred-age-threshold")?.value || 18);
      ok = active.age >= thr;
      detail = `age ≥ ${thr}`;
    } else {
      const setStr = document.getElementById("pred-mem-set")?.value || "night,dusk";
      const allowed = setStr.split(",").map((s) => s.trim());
      ok = allowed.includes(active.membership);
      detail = `membership ∈ {${allowed.join(", ")}}`;
    }

    setMeter(35, "35% — evaluating gate");
    mark("gate", "active", ok ? "true" : "false");
    await sleep(380);
    mark("gate", ok ? "done" : "fail", ok ? "PASS" : "FAIL");
    logTo("pred-log", `Gate ${detail} → ${ok ? "true" : "false"} (raw claim not published)`);

    setMeter(62, "62% — binding commit");
    mark("bind-commit", "active", short(active.commit, 6));
    await sleep(320);
    mark("bind-commit", "done", "bound");

    setMeter(88, "88% — emitting π");
    mark("prove", "active", "sim…");
    const pi = await sha256(
      `${DOMAIN}|π|${active.commit}|${detail}|${ok}|${active.salt}|${randomHex(4)}`
    );
    await sleep(400);
    mark("prove", ok ? "done" : "fail", short(pi, 6));

    active.lastPredicate = { kind: selectedPred, detail, ok, pi };
    if (!active.presented) active.presented = true;
    const i = passports.findIndex((p) => p.id === active.id);
    if (i >= 0) passports[i] = active;
    save();

    setMeter(100, ok ? "100% — predicate PASS (simulated)" : "100% — predicate FAIL (simulated)");
    if (card) card.className = "proof-result-card " + (ok ? "is-ok" : "is-fail");
    if (title) title.textContent = ok ? "PREDICATE PASS (sim)" : "PREDICATE FAIL (sim)";
    if (hash) hash.textContent = pi;
    if (note) {
      note.textContent = ok
        ? `LOCAL-TRUE · verified ${detail} without publishing the raw claim.`
        : `LOCAL-TRUE · ${detail} not satisfied — π still emitted for teaching.`;
    }
    logTo("pred-log", `π ${short(pi, 14)} · ${ok ? "PASS" : "FAIL"}`);
    toast(ok ? "Predicate PASS" : "Predicate FAIL");
    announce(ok ? "Predicate proof passed" : "Predicate proof failed");
    refreshAll();
  } finally {
    proving = false;
    updateButtons();
  }
}

async function verifyPresentation() {
  if (!active || !active.presented) return;
  if (active.revoked) {
    setStatus("disclose-status", "VERIFY FAIL — credential revoked.", "fail");
    toast("Verify fail · revoked");
    logTo("pred-log", "Verify REJECTED — nullifier present / revoked");
    announce("Verification failed: revoked");
    return;
  }
  const bindOk = !!(active.commit && active.issuerSig);
  const predNote = active.lastPredicate
    ? ` · pred ${active.lastPredicate.ok ? "ok" : "fail"}`
    : "";
  active.verified = bindOk;
  save();
  logTo(
    "pred-log",
    bindOk
      ? `VERIFY OK — commit↔issuerSig bind (sim)${predNote}`
      : "VERIFY FAIL — missing bind"
  );
  toast(bindOk ? "Verify OK (sim)" : "Verify fail");
  announce(bindOk ? "Presentation verified locally" : "Verification failed");
  refreshAll();
}

async function tamperPi() {
  if (!active?.lastPredicate) return;
  const bad = await sha256("TAMPER|" + active.lastPredicate.pi + "|" + randomHex(4));
  active.lastPredicate = {
    ...active.lastPredicate,
    pi: bad,
    ok: false,
    detail: active.lastPredicate.detail + " [TAMPERED]",
  };
  const i = passports.findIndex((p) => p.id === active.id);
  if (i >= 0) passports[i] = active;
  save();
  const card = document.getElementById("pred-result-card");
  const title = document.getElementById("pred-result-title");
  const hash = document.getElementById("pred-result-hash");
  if (card) card.className = "proof-result-card is-fail";
  if (title) title.textContent = "TAMPER DETECTED (sim)";
  if (hash) hash.textContent = bad;
  logTo("pred-log", `TAMPER — π mutated → verify would FAIL`);
  toast("Tamper demo · fail path");
  announce("Tampered proof — fail path");
  refreshAll();
}

async function revokePassport() {
  if (!active || active.revoked) return;
  const nullifier = await sha256(
    `${DOMAIN}|revoke|${active.commit}|${active.holderSecret}|${active.salt}`
  );
  active.revoked = true;
  active.revokeNullifier = nullifier;
  const i = passports.findIndex((p) => p.id === active.id);
  if (i >= 0) passports[i] = active;
  save();
  logTo("pred-log", `REVOKED · nullifier ${short(nullifier, 12)}`);
  setStatus("issue-status", "Passport revoked — presentations must fail.", "fail");
  toast("Passport revoked");
  announce("Passport revoked");
  refreshAll();
}

async function seedDemo() {
  document.getElementById("claim-name").value = "Night Steward";
  document.getElementById("claim-age").value = "27";
  document.getElementById("claim-role").value = "steward";
  document.getElementById("claim-membership").value = "night";
  document.getElementById("claim-region").value = "Midgard";
  document.getElementById("claim-salt").value = "";
  document.getElementById("holder-secret").value = "";
  const p = await issuePassport();
  if (!p) return;
  presentPassport();
  await runDisclose(["role"]);
  selectedPred = "age";
  syncPredCards();
  document.getElementById("pred-age-threshold").value = "18";
  await runPredicate();
  toast("Demo passport ready");
}

async function seedBoard() {
  await seedDemo();
  await issuePassport({
    displayName: "Dawn Guest",
    age: 16,
    role: "guest",
    membership: "dawn",
    region: "Asgard",
    salt: randomHex(16),
    holderSecret: randomHex(12),
  });
  if (active) {
    active.presented = true;
    save();
  }
  await issuePassport({
    displayName: "Dusk Auditor",
    age: 41,
    role: "auditor",
    membership: "dusk",
    region: "",
    salt: randomHex(16),
    holderSecret: randomHex(12),
  });
  refreshAll();
  toast("Demo board seeded");
}

function resetStudio() {
  if (!confirm("Reset Veil Passport Studio? Clears localStorage for this app.")) return;
  clearStudioState();
  passports = [];
  active = null;
  try {
    tabSync?.broadcast(snapshotState());
  } catch (_) {}
  const dlog = document.getElementById("disclose-log");
  const plog = document.getElementById("pred-log");
  if (dlog) dlog.textContent = "Awaiting disclosure…";
  if (plog) plog.textContent = "Awaiting prove…";
  setStatus("issue-status", "Studio reset.", "");
  setStatus("disclose-status", "", "");
  toast("Studio reset");
  announce("Studio reset");
  refreshAll();
}

function copyDonate() {
  const done = () => {
    setStatus("donate-status", "Address copied.", "ok");
    toast("Donate address copied");
    announce("Donation address copied");
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(DONATE_ADDR).then(done).catch(() => fallbackCopy(done));
  } else fallbackCopy(done);
}

function fallbackCopy(done) {
  const ta = document.createElement("textarea");
  ta.value = DONATE_ADDR;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch (_) {
    setStatus("donate-status", "Copy failed — select the address manually.", "fail");
  }
  ta.remove();
}

function syncPredCards() {
  document.querySelectorAll(".pred-card").forEach((card) => {
    const on = card.getAttribute("data-pred") === selectedPred;
    card.classList.toggle("is-selected", on);
    card.setAttribute("aria-checked", on ? "true" : "false");
  });
  const ageField = document.getElementById("pred-age-field");
  const memField = document.getElementById("pred-mem-field");
  if (ageField) ageField.hidden = selectedPred !== "age";
  if (memField) memField.hidden = selectedPred !== "membership";
}

/* Starfield */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let raf = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 12000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.6 + 0.2,
      s: Math.random() * 0.25 + 0.05,
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const st of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(199, 210, 254, ${st.a})`;
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
      if (!reduced) {
        st.y += st.s;
        st.a += (Math.random() - 0.5) * 0.02;
        st.a = Math.max(0.15, Math.min(0.85, st.a));
        if (st.y > window.innerHeight) {
          st.y = 0;
          st.x = Math.random() * window.innerWidth;
        }
      }
    }
    raf = requestAnimationFrame(frame);
  }
  resize();
  frame();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    frame();
  });
}

function initReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    nodes.forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  nodes.forEach((n) => io.observe(n));
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function bindUI() {
  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    const nav = document.getElementById("site-nav");
    const btn = document.getElementById("nav-toggle");
    const open = nav?.classList.toggle("is-open");
    if (btn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  });

  document.getElementById("btn-issue")?.addEventListener("click", () => {
    issuePassport().catch((e) => {
      console.error(e);
      setStatus("issue-status", "Issue failed.", "fail");
    });
  });
  document.getElementById("btn-seed")?.addEventListener("click", () => {
    seedDemo().catch(console.error);
  });
  document.getElementById("btn-present")?.addEventListener("click", presentPassport);
  document.getElementById("btn-disclose")?.addEventListener("click", () => {
    const keys = [...document.querySelectorAll("#disclose-chips input:checked")].map(
      (i) => i.value
    );
    runDisclose(keys).catch(console.error);
  });
  document.getElementById("btn-veil-all")?.addEventListener("click", () => {
    document.querySelectorAll("#disclose-chips input").forEach((i) => {
      i.checked = false;
    });
    syncDiscloseChips();
    runDisclose([]).catch(console.error);
  });
  document.getElementById("btn-overdisclose")?.addEventListener("click", () => {
    const keys = CLAIM_KEYS.filter((k) => {
      if (k === "region") return !!(active?.region && active.region.trim());
      return true;
    });
    document.querySelectorAll("#disclose-chips input").forEach((i) => {
      i.checked = keys.includes(i.value);
    });
    syncDiscloseChips();
    runDisclose(keys, { warn: true }).catch(console.error);
  });
  document.querySelectorAll("#disclose-chips .claim-chip").forEach((lab) => {
    lab.addEventListener("change", () => syncDiscloseChips());
  });

  document.querySelectorAll(".pred-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedPred = card.getAttribute("data-pred") || "age";
      syncPredCards();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectedPred = card.getAttribute("data-pred") || "age";
        syncPredCards();
      }
    });
  });

  document.getElementById("btn-prove")?.addEventListener("click", () => {
    runPredicate().catch(console.error);
  });
  document.getElementById("btn-verify")?.addEventListener("click", () => {
    verifyPresentation().catch(console.error);
  });
  document.getElementById("btn-tamper")?.addEventListener("click", () => {
    tamperPi().catch(console.error);
  });
  document.getElementById("btn-revoke")?.addEventListener("click", () => {
    revokePassport().catch(console.error);
  });
  document.getElementById("btn-seed-board")?.addEventListener("click", () => {
    seedBoard().catch(console.error);
  });
  document.getElementById("btn-reset")?.addEventListener("click", resetStudio);
  document.getElementById("btn-export")?.addEventListener("click", exportStudio);
  document.getElementById("btn-import")?.addEventListener("click", () => {
    document.getElementById("import-file")?.click();
  });
  document.getElementById("import-file")?.addEventListener("change", (e) => {
    const file = e.target?.files?.[0];
    importStudioFromFile(file).catch(console.error);
    e.target.value = "";
  });
  document.getElementById("btn-copy-donate")?.addEventListener("click", copyDonate);
  document.getElementById("dock-copy-addr")?.addEventListener("click", copyDonate);

  document.getElementById("passport-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-act=select]");
    if (!btn) return;
    const li = btn.closest("[data-id]");
    const id = li?.getAttribute("data-id");
    const p = passports.find((x) => x.id === id);
    if (p) {
      active = p;
      save();
      refreshAll();
      toast("Selected " + (p.displayName || "passport"));
    }
  });

  const help = document.getElementById("help-overlay");
  const closeHelp = () => {
    if (help) help.hidden = true;
  };
  const openHelp = () => {
    if (help) help.hidden = false;
  };
  document.getElementById("btn-close-help")?.addEventListener("click", closeHelp);
  help?.addEventListener("click", (e) => {
    if (e.target === help) closeHelp();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeHelp();
      return;
    }
    if (isTypingTarget(e.target)) return;
    if (e.key === "?" || (e.shiftKey && e.key === "/")) {
      e.preventDefault();
      if (help?.hidden) openHelp();
      else closeHelp();
      return;
    }
    if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      copyDonate();
      return;
    }
    if (e.key === "i" || e.key === "I") {
      e.preventDefault();
      document.getElementById("claim-name")?.focus();
      document.getElementById("issue")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      document.getElementById("disclose")?.scrollIntoView({ behavior: "smooth" });
      document.querySelector("#disclose-chips input")?.focus();
      return;
    }
    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      document.getElementById("predicate")?.scrollIntoView({ behavior: "smooth" });
      runPredicate().catch(console.error);
      return;
    }
    if (e.shiftKey && (e.key === "N" || e.key === "n")) {
      e.preventDefault();
      seedDemo().catch(console.error);
    }
  });
}

function boot() {
  load();
  startTabSync();
  bindUI();
  syncPredCards();
  initStarfield();
  initReveal();
  refreshAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
