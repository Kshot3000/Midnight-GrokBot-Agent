/**
 * Nocturne Messenger Studio — LOCAL-TRUE persistence.
 * Real localStorage, multi-tab sync, export/import.
 * Not a relay. Not Compact. Not on-chain.
 */
import {
  DONATE_ADDR,
  shortHex,
  escapeHtml,
  hex,
  sha256Hex,
  cleanHandle,
} from './nocturne-core.mjs';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
} from './persist.mjs';


/** @type {{id:string,handle:string,name:string,presence:"online"|"away"|"offline",blurb:string,color:string,replies:string[]}[]} */
const RESIDENTS = [
  {
    id: "moon",
    handle: "moon_whisper",
    name: "Moon Whisper",
    presence: "online",
    blurb: "Sealed night notes",
    color: "#a78bfa",
    replies: [
      "Envelope received — commitment matches my local open.",
      "Keeping the body veiled. Only the hash rides the rail.",
      "Midnight dual-state: public commit, private whisper.",
    ],
  },
  {
    id: "ada",
    handle: "ada_dev",
    name: "Ada Dev",
    presence: "online",
    blurb: "Cardano by day",
    color: "#22d3ee",
    replies: [
      "Nice seal. Reminds me of bboard commits — disclose the hash, not the note.",
      "MPS-0029 tip: never authorize with ownPublicKey alone.",
      "Local stub Acknowledged. Real relay still out of scope.",
    ],
  },
  {
    id: "oracle",
    handle: "night_oracle",
    name: "Night Oracle",
    presence: "away",
    blurb: "Predicate proofs",
    color: "#7c9cff",
    replies: [
      "I can prove I read it without publishing the body.",
      "Selective reveal > dump-everything audit logs.",
      "Nullifier idea: one open per envelope, no double-spend of the reveal.",
    ],
  },
  {
    id: "veil",
    handle: "veil_keeper",
    name: "Veil Keeper",
    presence: "offline",
    blurb: "Vault steward",
    color: "#6ee7b7",
    replies: [
      "Vault quiet. Your body never left this browser.",
      "When you reveal, open one claim — leave the rest sealed.",
      "Teaching only: no Lace, no proof server, no chain.",
    ],
  },
];

const GLOSSARY = [
  {
    term: "envelope veil",
    body: "Private message body held locally (witness-like). Observers see a commitment, not plaintext.",
  },
  {
    term: "commitment",
    body: "Domain-separated hash of (thread ∥ body ∥ salt) published as the public rail stand-in.",
  },
  {
    term: "selective reveal",
    body: "Open one sealed claim without dumping every message body onto the public surface.",
  },
  {
    term: "device commit",
    body: "Local identity fingerprint from handle + entropy. Teaching stand-in — not a Midnight wallet address.",
  },
  {
    term: "nullifier (msg)",
    body: "Teaching idea: mark an envelope as opened once so the same reveal cannot be replayed.",
  },
  {
    term: "relay (out of scope)",
    body: "Cross-device delivery needs WebSocket/WebRTC + real auth. This studio deliberately stays local.",
  },
  {
    term: "dual-state",
    body: "Midnight pattern: public ledger surface ↔ private local state via ZK. Messaging maps commit ↔ body.",
  },
  {
    term: "disclose",
    body: "Publish only derived public values (commit, counters). Never disclose raw sealed bodies.",
  },
  {
    term: "SIMULATED peer",
    body: "Seeded residents and canned replies exist only in your browser for theater.",
  },
];

/** @type {{handle:string,commit:string,sealedAt:string,passWrapped:boolean}|null} */
let identity = null;
/** @type {string|null} */
let activeThreadId = null;
/** @type {Record<string, {id:string,from:string,body:string,commit:string,salt:string,ts:number,mine:boolean,revealed:boolean,veiled:boolean}[]>} */
let threads = {};
/** @type {{commit:string,body:string,salt:string,peer:string,ts:number}|null} */
let lastEnvelope = null;
let phase = "idle";
let toastTimer = null;
let typingTimer = null;

let tabSync = null;
let applyingRemote = false;

function snapshotState() {
  return { identity, activeThreadId, threads, lastEnvelope, phase };
}

function applyStudio(data, { announceRemote = false } = {}) {
  identity = data?.identity || null;
  activeThreadId = data?.activeThreadId ?? null;
  threads = data?.threads && typeof data.threads === 'object' ? data.threads : {};
  lastEnvelope = data?.lastEnvelope || null;
  phase = data?.phase || 'idle';
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
        renderIdentity();
        renderThreads();
        renderChat();
        renderEnvelope();
        updateRails();
        setPhase(phase || 'idle');
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
  a.download = `nocturne-messenger-export-${stamp}.json`;
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
  if (!window.confirm("Import replaces this tab's Nocturne Messenger data. Continue?")) return;
  applyingRemote = true;
  try {
    applyStudio(result.state);
    saveStudioState(snapshotState());
    tabSync?.broadcast(snapshotState());
  } finally {
    applyingRemote = false;
  }
  renderIdentity();
  renderThreads();
  renderChat();
  renderEnvelope();
  updateRails();
  setPhase(phase || 'idle');
  toast('Import applied — LOCAL educational data, not on-chain.');
  announce('Nocturne imported');
}


function announce(msg) {
  const el = document.getElementById("live-region");
  if (el) el.textContent = msg;
}

function toast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-show"), 2200);
}







function setPhase(next) {
  const order = ["idle", "identity", "thread", "sealed", "committed", "revealed"];
  const nextIdx = order.indexOf(next);
  const curIdx = order.indexOf(phase);
  if (nextIdx < 0) return;
  // Allow forward or explicit resets handled by callers
  phase = next;
  const steps = document.querySelectorAll(".journey-step");
  steps.forEach((li) => {
    const p = li.getAttribute("data-phase") || "";
    const idx = order.indexOf(p);
    li.classList.remove("is-active", "is-done");
    li.removeAttribute("aria-current");
    if (idx < nextIdx) li.classList.add("is-done");
    if (idx === nextIdx) {
      li.classList.add("is-active");
      li.setAttribute("aria-current", "step");
    }
  });
  const labels = {
    idle: "Phase: idle — claim a Nocturne handle to begin.",
    identity: "Phase: identity — local device seal ready. Pick a thread.",
    thread: "Phase: thread — compose a private body, then seal & commit.",
    sealed: "Phase: sealed — body in envelope veil.",
    committed: "Phase: committed — public hash on the ledger rail.",
    revealed: "Phase: revealed — selective open completed (theater).",
  };
  const live = document.getElementById("journey-live");
  if (live) live.textContent = labels[next] || next;
  save();
}

function updateRails() {
  let veiled = 0;
  let commits = 0;
  Object.values(threads).forEach((msgs) => {
    msgs.forEach((m) => {
      if (m.veiled && !m.revealed) veiled += 1;
      if (m.commit) commits += 1;
    });
  });
  const total = Math.max(veiled + commits, 1);
  const veilPct = Math.min(100, Math.round((veiled / total) * 100) || (identity ? 18 : 0));
  const ledPct = Math.min(100, Math.round((commits / Math.max(commits + 2, 4)) * 100) || (commits ? 22 : 0));
  const setMeter = (id, labelId, pct, label) => {
    const m = document.getElementById(id);
    const lab = document.getElementById(labelId);
    if (m) {
      m.setAttribute("aria-valuenow", String(pct));
      const fill = m.querySelector(".rail-fill");
      if (fill) fill.style.width = pct + "%";
    }
    if (lab) lab.textContent = label;
  };
  setMeter("rail-veil", "rail-veil-label", veilPct, `${veilPct}% veil · ${veiled} sealed bodies`);
  setMeter("rail-ledger", "rail-ledger-label", ledPct, `${ledPct}% ledger · ${commits} commits`);
}

function renderIdentity() {
  const h = document.getElementById("id-handle");
  const c = document.getElementById("id-commit");
  const s = document.getElementById("id-sealed-at");
  const st = document.getElementById("id-status");
  if (!identity) {
    if (h) h.textContent = "—";
    if (c) c.textContent = "—";
    if (s) s.textContent = "—";
    if (st) st.textContent = "No identity";
    return;
  }
  if (h) h.textContent = "@" + identity.handle;
  if (c) c.textContent = shortHex(identity.commit, 12);
  if (s) s.textContent = identity.sealedAt;
  if (st) st.textContent = identity.passWrapped ? "Wrapped locally (passphrase)" : "Device seal ready";
}

function ensureThread(id) {
  if (!threads[id]) threads[id] = [];
}

function renderThreads() {
  const list = document.getElementById("thread-list");
  if (!list) return;
  list.innerHTML = "";
  RESIDENTS.forEach((r) => {
    ensureThread(r.id);
    const msgs = threads[r.id];
    const last = msgs[msgs.length - 1];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "thread-item" + (activeThreadId === r.id ? " is-active" : "");
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", activeThreadId === r.id ? "true" : "false");
    btn.dataset.id = r.id;
    const initials = r.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2);
    const preview = last
      ? last.veiled && !last.revealed
        ? "◈ sealed " + shortHex(last.commit, 6)
        : last.body.slice(0, 28)
      : r.blurb;
    const t = last ? new Date(last.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
    btn.innerHTML = `
      <span class="thread-avatar" style="--c:${r.color}">${escapeHtml(initials)}
        <span class="presence-dot ${escapeHtml(r.presence)}" title="${escapeHtml(r.presence)}"></span>
      </span>
      <span class="thread-meta">
        <strong>@${escapeHtml(r.handle)}</strong>
        <span>${escapeHtml(preview)}</span>
      </span>
      <span class="thread-time">${escapeHtml(t)}</span>`;
    btn.addEventListener("click", () => selectThread(r.id));
    list.appendChild(btn);
  });
}

function renderChat() {
  const log = document.getElementById("chat-log");
  const peerEl = document.getElementById("chat-peer");
  const presenceEl = document.getElementById("chat-presence");
  const compose = document.getElementById("compose-input");
  const btnSeal = document.getElementById("btn-seal");
  const btnClear = document.getElementById("btn-clear-compose");
  const meta = document.getElementById("compose-meta");
  if (!log) return;

  if (!activeThreadId) {
    log.innerHTML = '<div class="msg system">Pick a resident thread to begin a sealed conversation.</div>';
    if (peerEl) peerEl.textContent = "Select a thread";
    if (presenceEl) presenceEl.textContent = "—";
    if (compose) compose.disabled = true;
    if (btnSeal) btnSeal.disabled = true;
    if (btnClear) btnClear.disabled = true;
    if (meta) meta.textContent = identity ? "Pick a thread" : "Claim identity + pick a thread";
    return;
  }

  const r = RESIDENTS.find((x) => x.id === activeThreadId);
  if (peerEl) peerEl.textContent = r ? `@${r.handle}` : "Thread";
  if (presenceEl)
    presenceEl.textContent = r
      ? `${r.name} · ${r.presence} · ${r.blurb}`
      : "—";

  const canCompose = !!identity && !!activeThreadId;
  if (compose) compose.disabled = !canCompose;
  if (btnSeal) btnSeal.disabled = !canCompose;
  if (btnClear) btnClear.disabled = !canCompose;
  if (meta)
    meta.textContent = canCompose
      ? "Body stays veiled · commit publishes"
      : "Claim identity + pick a thread";

  const msgs = threads[activeThreadId] || [];
  if (!msgs.length) {
    log.innerHTML =
      '<div class="msg system">Thread empty. Compose a private body, then Seal &amp; commit. Peer replies are simulated locally.</div>';
    return;
  }

  log.innerHTML = msgs
    .map((m) => {
      const cls = m.from === "system" ? "system" : m.mine ? "mine" : "theirs";
      const who = m.from === "system" ? "system" : m.mine ? "@" + (identity?.handle || "you") : "@" + (r?.handle || m.from);
      const time = new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const body =
        m.veiled && !m.revealed
          ? `<div class="msg-body veiled">◈ sealed · ${escapeHtml(shortHex(m.commit, 14))}</div>`
          : `<div class="msg-body">${escapeHtml(m.body)}</div>`;
      const foot =
        m.commit
          ? `<div class="msg-foot"><span class="msg-commit" title="Public commitment">${escapeHtml(
              shortHex(m.commit, 10)
            )}</span>${m.mine ? '<span class="msg-ticks" title="Local delivery theater">✓✓</span>' : ""}${
              m.revealed ? '<span class="badge badge-lab" style="font-size:0.65rem">revealed</span>' : ""
            }</div>`
          : "";
      return `<article class="msg ${cls}">
        <div class="msg-head"><span class="who">${escapeHtml(who)}</span><span>${escapeHtml(time)}</span></div>
        ${body}${foot}
      </article>`;
    })
    .join("");
  log.scrollTop = log.scrollHeight;
}

function renderEnvelope() {
  const body = document.getElementById("envelope-body");
  if (!body) return;
  if (!lastEnvelope) {
    body.innerHTML = '<p class="muted">Seal a message to see the public commitment vs private body split.</p>';
    return;
  }
  body.innerHTML = `
    <h4>Latest sealed envelope</h4>
    <dl class="envelope-kv">
      <div><dt>Peer</dt><dd>@${escapeHtml(lastEnvelope.peer)}</dd></div>
      <div><dt>Commit</dt><dd>${escapeHtml(lastEnvelope.commit)}</dd></div>
      <div><dt>Salt</dt><dd>${escapeHtml(shortHex(lastEnvelope.salt, 8))}</dd></div>
      <div><dt>Body (local)</dt><dd>${escapeHtml(lastEnvelope.body)}</dd></div>
      <div><dt>Tagged</dt><dd>nocturne:msg:</dd></div>
    </dl>
    <p class="muted small">Public rail would carry the commit only. Body remains witness-like in this browser.</p>`;
}

function selectThread(id) {
  activeThreadId = id;
  if (identity && phase === "identity") setPhase("thread");
  else if (identity && (phase === "idle" || !phase)) setPhase("thread");
  renderThreads();
  renderChat();
  const r = RESIDENTS.find((x) => x.id === id);
  announce(`Thread @${r?.handle || id} selected`);
  toast(`Opened @${r?.handle || id}`);
  save();
}

async function claimIdentity(handle, pass) {
  const clean = cleanHandle(handle);
  if (!clean || clean.length < 2) {
    toast("Handle needs 2+ letters/numbers");
    announce("Invalid handle");
    return false;
  }
  const entropy = crypto.getRandomValues(new Uint8Array(16));
  const salt = hex(entropy);
  const material = `nocturne:device:${clean}:${salt}:${pass ? "wrapped" : "open"}`;
  const commit = await sha256Hex(material);
  identity = {
    handle: clean,
    commit,
    sealedAt: new Date().toLocaleString(),
    passWrapped: !!pass,
  };
  renderIdentity();
  setPhase("identity");
  updateComposeEnabled();
  renderChat();
  toast(`Claimed @${clean}`);
  announce(`Identity @${clean} claimed`);
  appendSealLog(`device seal · @${clean} · ${shortHex(commit, 12)}`);
  save();
  return true;
}

function updateComposeEnabled() {
  renderChat();
}

function appendSealLog(line) {
  const log = document.getElementById("seal-log");
  if (!log) return;
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (log.textContent.startsWith("Awaiting")) log.textContent = "";
  log.textContent += `[${ts}] ${line}\n`;
  log.scrollTop = log.scrollHeight;
}

function appendRevealLog(line) {
  const log = document.getElementById("reveal-log");
  if (!log) return;
  const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (log.textContent.startsWith("Awaiting")) log.textContent = "";
  log.textContent += `[${ts}] ${line}\n`;
  log.scrollTop = log.scrollHeight;
}

async function sealAndCommit(bodyText) {
  if (!identity) {
    toast("Claim identity first");
    return;
  }
  if (!activeThreadId) {
    toast("Pick a thread");
    return;
  }
  const body = String(bodyText || "").trim();
  if (!body) {
    toast("Write a private body");
    return;
  }
  const r = RESIDENTS.find((x) => x.id === activeThreadId);
  const salt = hex(crypto.getRandomValues(new Uint8Array(8)));
  const payload = `nocturne:msg:${activeThreadId}:${identity.handle}:${salt}:${body}`;
  appendSealLog("hashing sealed body (WebCrypto SHA-256)…");
  const commit = await sha256Hex(payload);
  setPhase("sealed");
  appendSealLog(`veil locked · body ${body.length} chars`);

  await wait(reduced() ? 40 : 380);
  setPhase("committed");
  appendSealLog(`commit ${shortHex(commit, 14)} published to ledger rail (sim)`);

  const msg = {
    id: "m_" + Date.now().toString(36),
    from: identity.handle,
    body,
    commit,
    salt,
    ts: Date.now(),
    mine: true,
    revealed: false,
    veiled: true,
  };
  ensureThread(activeThreadId);
  threads[activeThreadId].push(msg);
  lastEnvelope = {
    commit,
    body,
    salt,
    peer: r?.handle || activeThreadId,
    ts: Date.now(),
  };
  renderEnvelope();
  renderThreads();
  renderChat();
  updateRails();
  toast("Sealed & committed");
  announce("Message sealed; commitment on ledger rail");
  save();

  // Simulated peer reply
  schedulePeerReply(activeThreadId);
}

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function schedulePeerReply(threadId) {
  const r = RESIDENTS.find((x) => x.id === threadId);
  if (!r || r.presence === "offline") return;
  const line = document.getElementById("typing-line");
  const text = document.getElementById("typing-text");
  if (line) line.hidden = false;
  if (text) text.textContent = `@${r.handle} is typing…`;
  clearTimeout(typingTimer);
  typingTimer = setTimeout(async () => {
    if (line) line.hidden = true;
    if (activeThreadId !== threadId) return;
    const reply = r.replies[Math.floor(Math.random() * r.replies.length)];
    const salt = hex(crypto.getRandomValues(new Uint8Array(8)));
    const payload = `nocturne:msg:${threadId}:${r.handle}:${salt}:${reply}`;
    const commit = await sha256Hex(payload);
    threads[threadId].push({
      id: "m_" + Date.now().toString(36),
      from: r.handle,
      body: reply,
      commit,
      salt,
      ts: Date.now(),
      mine: false,
      revealed: true,
      veiled: false,
    });
    renderThreads();
    renderChat();
    updateRails();
    appendSealLog(`sim reply · @${r.handle} · ${shortHex(commit, 10)}`);
    announce(`@${r.handle} replied (simulated)`);
    save();
  }, reduced() ? 200 : 1100 + Math.random() * 700);
}

async function runRevealTheater() {
  const findings = document.getElementById("reveal-findings");
  const summary = document.getElementById("reveal-summary");
  const status = document.getElementById("reveal-status");
  const scoreEl = document.getElementById("reveal-score");
  const ring = document.getElementById("reveal-ring-fill");

  if (!lastEnvelope) {
    toast("Seal a message first");
    if (status) {
      status.textContent = "No envelope";
      status.className = "status warn";
    }
    return;
  }

  if (status) {
    status.textContent = "Running theater…";
    status.className = "status";
  }
  appendRevealLog("selective reveal start");
  await wait(reduced() ? 30 : 320);

  // Recompute commit to "verify"
  const threadId =
    Object.keys(threads).find((tid) =>
      (threads[tid] || []).some((m) => m.commit === lastEnvelope.commit)
    ) || activeThreadId;
  const checkPayload = `nocturne:msg:${threadId}:${identity?.handle || "?"}:${lastEnvelope.salt}:${lastEnvelope.body}`;
  const recomputed = await sha256Hex(checkPayload);
  const match = recomputed === lastEnvelope.commit;
  appendRevealLog(match ? "commitment regenerates ✓" : "commitment mismatch ✗");

  // Reveal the local veiled mine message
  let opened = 0;
  let stillVeiled = 0;
  Object.values(threads).forEach((msgs) => {
    msgs.forEach((m) => {
      if (m.commit === lastEnvelope.commit && m.veiled) {
        m.revealed = true;
        opened += 1;
      }
      if (m.veiled && !m.revealed) stillVeiled += 1;
    });
  });

  const score = match ? (stillVeiled > 0 ? 92 : 88) : 34;
  if (scoreEl) scoreEl.textContent = String(score);
  if (ring) {
    const circ = 2 * Math.PI * 52;
    const offset = circ - (score / 100) * circ;
    ring.style.strokeDasharray = String(circ);
    ring.style.strokeDashoffset = String(offset);
    ring.style.stroke = score >= 80 ? "var(--ok)" : score >= 50 ? "var(--warn)" : "var(--danger)";
  }

  const items = [
    {
      sev: match ? "ok" : "danger",
      title: match ? "Commitment verifies" : "Commitment failed",
      body: match
        ? "SHA-256(nocturne:msg:∥thread∥handle∥salt∥body) matches the published commit."
        : "Recomputed hash does not match — teaching failure path.",
    },
    {
      sev: "ok",
      title: "Selective open",
      body: `Opened ${opened} envelope(s) locally. Other veiled bodies stay sealed (${stillVeiled}).`,
    },
    {
      sev: "info",
      title: "Ledger surface unchanged",
      body: "Only the commitment was 'public'. Reveal theater did not invent an on-chain decrypt.",
    },
    {
      sev: "warn",
      title: "Not a relay / not Compact",
      body: "This UI never claims Midnight network delivery, Lace, or a real circuit.",
    },
  ];

  if (findings) {
    findings.innerHTML = items
      .map(
        (it) => `<div class="finding">
        <span class="finding-sev ${it.sev}">${it.sev}</span>
        <div><strong>${escapeHtml(it.title)}</strong><p>${escapeHtml(it.body)}</p></div>
      </div>`
      )
      .join("");
  }
  if (summary)
    summary.textContent = match
      ? `Selective reveal OK · score ${score} · ${stillVeiled} still veiled`
      : `Reveal failed integrity check · score ${score}`;
  if (status) {
    status.textContent = match ? "Reveal complete (sim)" : "Reveal failed";
    status.className = match ? "status ok" : "status danger";
  }
  setPhase("revealed");
  renderChat();
  renderThreads();
  updateRails();
  appendRevealLog(`score ${score} · opened ${opened} · veiled left ${stillVeiled}`);
  toast(match ? "Selective reveal complete" : "Reveal failed");
  announce(match ? "Selective reveal theater complete" : "Reveal theater failed");
  save();
}

function renderGlossary() {
  const grid = document.getElementById("glossary-grid");
  if (!grid) return;
  grid.innerHTML = "";
  GLOSSARY.forEach((g) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "glossary-card";
    btn.innerHTML = `<strong>${escapeHtml(g.term)}</strong><span>${escapeHtml(g.body)}</span>`;
    btn.addEventListener("click", () => {
      toast(g.term);
      announce(g.term + ": " + g.body);
    });
    grid.appendChild(btn);
  });
}

async function copyDonate() {
  try {
    await navigator.clipboard.writeText(DONATE_ADDR);
    toast("Donation address copied");
    announce("Donation address copied");
    const dock = document.getElementById("dock-copy-addr");
    if (dock) {
      const prev = dock.textContent;
      dock.textContent = "Copied!";
      setTimeout(() => {
        dock.textContent = prev;
      }, 1600);
    }
  } catch (_) {
    toast("Copy failed — select the address manually");
  }
}

function isTypingTarget(el) {
  if (!el) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "textarea" || tag === "input" || tag === "select") return true;
  return !!el.isContentEditable;
}

function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const reducedMotion = reduced();
  let stars = [];
  let raf = 0;
  let w = 0;
  let h = 0;

  function resize() {
    w = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    h = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.min(170, Math.floor((window.innerWidth * window.innerHeight) / 13000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.7 + 0.2,
      v: Math.random() * 0.15 + 0.02,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(200, 220, 255, ${s.a})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (!reducedMotion) {
        s.y += s.v;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
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
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-in"));
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
  els.forEach((el) => io.observe(el));
}

async function seedDemo() {
  await claimIdentity("kshot_lab", "");
  selectThread("moon");
  const compose = document.getElementById("compose-input");
  if (compose) compose.value = "Quiet night on Midnight — sealing this note so only the commit rides the rail.";
  await sealAndCommit(compose.value);
  if (compose) compose.value = "";
  toast("Demo thread seeded");
}

function resetLocal() {
  if (!window.confirm('Reset Nocturne Messenger Studio? Clears localStorage for this app.')) return;
  clearStudioState();
  identity = null;
  activeThreadId = null;
  threads = {};
  lastEnvelope = null;
  phase = 'idle';
  renderIdentity();
  renderThreads();
  renderChat();
  renderEnvelope();
  updateRails();
  setPhase('idle');
  const sealLog = document.getElementById('seal-log');
  const revealLog = document.getElementById('reveal-log');
  if (sealLog) sealLog.textContent = 'Awaiting seal theater…';
  if (revealLog) revealLog.textContent = 'Awaiting reveal theater…';
  save();
  toast('Local state cleared');
  announce('Local Nocturne state reset');
}


function bindUI() {
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.getElementById("identity-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const handle = /** @type {HTMLInputElement} */ (document.getElementById("handle-input"))?.value;
    const pass = /** @type {HTMLInputElement} */ (document.getElementById("pass-input"))?.value;
    claimIdentity(handle, pass).catch(console.error);
  });

  document.getElementById("btn-seed-demo")?.addEventListener("click", () => {
    seedDemo().catch(console.error);
  });
  document.getElementById("btn-reset-id")?.addEventListener("click", resetLocal);
  document.getElementById("btn-export")?.addEventListener("click", exportStudio);
  document.getElementById("btn-import")?.addEventListener("click", () => {
    document.getElementById("import-file")?.click();
  });
  document.getElementById("import-file")?.addEventListener("change", (e) => {
    const file = e.target?.files?.[0];
    importStudioFromFile(file).catch(console.error);
    e.target.value = "";
  });

  document.getElementById("compose-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = /** @type {HTMLTextAreaElement} */ (document.getElementById("compose-input"));
    sealAndCommit(input?.value || "").then(() => {
      if (input) input.value = "";
    });
  });
  document.getElementById("btn-clear-compose")?.addEventListener("click", () => {
    const input = /** @type {HTMLTextAreaElement} */ (document.getElementById("compose-input"));
    if (input) input.value = "";
  });

  document.getElementById("btn-run-reveal")?.addEventListener("click", () => {
    runRevealTheater().catch(console.error);
    document.getElementById("reveal")?.scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("btn-copy-donate")?.addEventListener("click", copyDonate);
  document.getElementById("dock-copy-addr")?.addEventListener("click", copyDonate);
  document.getElementById("btn-copy-snippet")?.addEventListener("click", async () => {
    const pre = document.getElementById("compact-snippet");
    const text = pre?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      toast("Sketch copied");
    } catch (_) {
      toast("Copy failed");
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
      document.getElementById("identity")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("handle-input")?.focus();
      return;
    }
    if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      document.getElementById("messenger")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("thread-list")?.focus();
      return;
    }
    if (e.shiftKey && (e.key === "N" || e.key === "n")) {
      e.preventDefault();
      seedDemo().catch(console.error);
      return;
    }
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      document.getElementById("messenger")?.scrollIntoView({ behavior: "smooth" });
      document.getElementById("compose-input")?.focus();
      return;
    }
    if (e.key === "s" || e.key === "S") {
      e.preventDefault();
      const input = /** @type {HTMLTextAreaElement} */ (document.getElementById("compose-input"));
      sealAndCommit(input?.value || "").then(() => {
        if (input) input.value = "";
      });
      return;
    }
    if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      runRevealTheater().catch(console.error);
      document.getElementById("reveal")?.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function boot() {
  renderGlossary();
  bindUI();
  initStarfield();
  initReveal();
  load();
  startTabSync();
  renderIdentity();
  renderThreads();
  renderChat();
  renderEnvelope();
  updateRails();
  setPhase(phase || (identity ? 'identity' : 'idle'));
}


if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
