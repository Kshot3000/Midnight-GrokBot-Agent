/**
 * Veil Pledge Studio — private tip jar / pledge board (local-true).
 * Real localStorage persistence, multi-tab sync, export/import.
 * Teaching commitments + threshold theater. Not Compact. Not on-chain.
 */
import {
  DONATE_ADDR,
  short,
  escapeHtml,
  commitHash,
  proveThreshold as proveThresholdCore,
} from "./pledge-core.mjs";
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
  loadDraft as persistLoadDraft,
  saveDraft as persistDraft,
} from "./persist.mjs";



  /** @type {{ id: string, handle: string, commitment: string, salt: string, amount: number, note: string, createdAt: string, disclosure: 'sealed'|'range'|'full', rangeMin?: number }[]} */
  let pledges = [];

  /** @type {{ amount: number, note: string, handle: string, salt: string, commitment: string } | null} */
  let draft = null;

  const threshLog = [];

  function randomHex(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
  }



  function announce(msg) {
    const el = document.getElementById("live-region");
    if (el) el.textContent = msg;
  }

  function setStatus(id, text, kind = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `status${kind ? ` ${kind}` : ""}`;
  }


  let tabSync = null;
  let applyingRemote = false;

  function snapshotState() {
    return { pledges, draft };
  }

  function applyState(data, { announceRemote = false } = {}) {
    pledges = Array.isArray(data.pledges) ? data.pledges : [];
    draft = data.draft || null;
    if (announceRemote) {
      announce("Pledge studio synced from another tab");
      pushThreshLog("Synced from another tab (BroadcastChannel / storage).");
    }
  }

  function savePledges() {
    if (applyingRemote) return;
    const saved = saveStudioState(snapshotState());
    try {
      tabSync?.broadcast(saved);
    } catch (_) {}
    // keep draft key in sync
    persistDraft(draft);
  }

  function loadPledges() {
    const data = loadStudioState();
    applyState(data);
  }

  function loadDraft() {
    // draft may live inside schema v2 state; fall back to DRAFT_KEY
    if (draft) return;
    draft = persistLoadDraft();
  }

  function saveDraft() {
    persistDraft(draft);
    // also mirror into studio state when possible
    if (!applyingRemote) {
      try {
        saveStudioState(snapshotState());
        tabSync?.broadcast(snapshotState());
      } catch (_) {}
    }
  }

  function startTabSync() {
    tabSync?.stop();
    tabSync = createTabSync({
      onRemote(state) {
        applyingRemote = true;
        try {
          applyState(state, { announceRemote: true });
          renderDraftPreview();
          renderBoard();
        } finally {
          applyingRemote = false;
        }
      },
    });
  }

  function exportStudio() {
    const json = exportStudioJSON(snapshotState());
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    a.href = url;
    a.download = `veil-pledge-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    announce("Studio exported as JSON");
    pushThreshLog("export · local snapshot downloaded (sensitive — amounts/salts).");
  }

  async function importStudioFromFile(file) {
    if (!file) return;
    const text = await file.text();
    const result = importStudioJSON(text);
    if (!result.ok) {
      setStatus("seal-status", result.error || "Import failed", "fail");
      announce("Import failed");
      return;
    }
    if (!window.confirm("Import replaces this tab's Veil Pledge data. Continue?")) return;
    applyingRemote = true;
    try {
      applyState(result.state);
      saveStudioState(snapshotState());
      persistDraft(draft);
      tabSync?.broadcast(snapshotState());
    } finally {
      applyingRemote = false;
    }
    renderDraftPreview();
    renderBoard();
    setJourney(
      pledges.some((p) => p.disclosure !== "sealed") ? "disclosed" : pledges.length ? "committed" : "idle",
      "Imported local snapshot — still LOCAL-TRUE educational data, not on-chain."
    );
    announce("Pledge studio imported");
    pushThreshLog(`import · ${result.state.pledges.length} pledge(s)`);
  }

  function setJourney(phase, detail) {
    const order = ["idle", "sealed", "committed", "disclosed"];
    const idx = order.indexOf(phase);
    document.querySelectorAll(".journey-step").forEach((step) => {
      const p = step.getAttribute("data-phase");
      const pi = order.indexOf(p || "");
      step.classList.remove("is-active", "is-done");
      step.removeAttribute("aria-current");
      if (p === phase) {
        step.classList.add("is-active");
        step.setAttribute("aria-current", "step");
      } else if (pi >= 0 && pi < idx) {
        step.classList.add("is-done");
      }
    });
    const live = document.getElementById("journey-live");
    if (live) {
      live.textContent = detail || `Phase: ${phase}`;
      live.className = `journey-live status${
        phase === "disclosed" ? " warn" : phase === "committed" ? " ok" : phase === "sealed" ? " warn" : ""
      }`;
    }
  }

  function syncRails() {
    const total = pledges.length;
    const disclosed = pledges.filter((p) => p.disclosure !== "sealed").length;
    const sealedPct = total === 0 ? 100 : Math.round(((total - disclosed) / total) * 100);
    const discPct = total === 0 ? 0 : Math.round((disclosed / total) * 100);

    const setMeter = (id, pct, labelId, label) => {
      const meter = document.getElementById(id);
      const fill = meter?.querySelector(".rail-fill");
      const lab = document.getElementById(labelId);
      if (fill) fill.style.width = `${pct}%`;
      if (meter) meter.setAttribute("aria-valuenow", String(pct));
      if (lab) lab.textContent = label;
    };

    setMeter(
      "rail-sealed",
      sealedPct,
      "rail-sealed-label",
      total === 0 ? "100% veiled (no pledges yet)" : `${sealedPct}% still sealed`
    );
    setMeter(
      "rail-disclose",
      discPct,
      "rail-disclose-label",
      total === 0 ? "0% disclosed" : `${discPct}% disclosed (range or full)`
    );
  }

  function syncJourneyFromState() {
    if (draft && !pledges.some((p) => p.commitment === draft.commitment)) {
      setJourney("sealed", "Phase: sealed — draft in vault, ready to commit.");
      return;
    }
    if (pledges.length === 0) {
      setJourney("idle", "Phase: idle — compose a private pledge to begin.");
      return;
    }
    const anyFull = pledges.some((p) => p.disclosure === "full" || p.disclosure === "range");
    if (anyFull) {
      setJourney("disclosed", "Phase: disclosed — at least one pledge revealed range or full.");
    } else {
      setJourney("committed", "Phase: committed — public hashes on the board, amounts veiled.");
    }
  }

  function renderDraftPreview() {
    const saltEl = document.getElementById("prev-salt");
    const commitEl = document.getElementById("prev-commit");
    const amountEl = document.getElementById("prev-amount");
    const noteEl = document.getElementById("prev-note");
    const btn = document.getElementById("btn-commit");

    if (!draft) {
      if (saltEl) saltEl.textContent = "—";
      if (commitEl) commitEl.textContent = "—";
      if (amountEl) amountEl.textContent = "—";
      if (noteEl) noteEl.textContent = "—";
      if (btn) btn.disabled = true;
      return;
    }
    if (saltEl) saltEl.textContent = short(draft.salt, 12);
    if (commitEl) commitEl.textContent = draft.commitment;
    if (amountEl) amountEl.textContent = `${draft.amount.toFixed(2)} ADA (private)`;
    if (noteEl) noteEl.textContent = draft.note || "(empty)";
    if (btn) btn.disabled = false;
  }

  function pushThreshLog(line) {
    const stamp = new Date().toLocaleTimeString();
    threshLog.unshift(`[${stamp}] ${line}`);
    if (threshLog.length > 40) threshLog.length = 40;
    const el = document.getElementById("thresh-log");
    if (el) el.textContent = threshLog.join("\n");
  }

  function setProofResult(text, kind) {
    const badge = document.getElementById("proof-badge");
    const res = document.getElementById("proof-result");
    if (res) res.textContent = text;
    if (badge) {
      badge.classList.remove("is-ok", "is-fail");
      if (kind === "ok") badge.classList.add("is-ok");
      if (kind === "fail") badge.classList.add("is-fail");
    }
  }

  function updateSelect() {
    const sel = document.getElementById("thresh-pledge");
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">— select a committed pledge —</option>`;
    pledges.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      const tag =
        p.disclosure === "sealed" ? "sealed" : p.disclosure === "range" ? `≥${p.rangeMin}` : "full";
      opt.textContent = `${p.handle || "anon"} · ${short(p.commitment, 8)} · ${tag}`;
      sel.appendChild(opt);
    });
    if (cur && pledges.some((p) => p.id === cur)) sel.value = cur;
  }

  function renderBoard() {
    const list = document.getElementById("pledge-list");
    const count = document.getElementById("stat-count");
    const sealed = document.getElementById("stat-sealed");
    const disclosed = document.getElementById("stat-disclosed");
    const sumEl = document.getElementById("stat-sum");

    const sealedN = pledges.filter((p) => p.disclosure === "sealed").length;
    const discN = pledges.length - sealedN;
    const sum = pledges.reduce((a, p) => a + (Number(p.amount) || 0), 0);

    if (count) count.textContent = String(pledges.length);
    if (sealed) sealed.textContent = String(sealedN);
    if (disclosed) disclosed.textContent = String(discN);
    if (sumEl) sumEl.textContent = pledges.length ? `${sum.toFixed(2)} ADA (vault)` : "—";

    updateJar(sum);
    updateSelect();
    syncRails();
    syncJourneyFromState();

    if (!list) return;
    if (pledges.length === 0) {
      list.innerHTML = `<li class="empty empty-rich" role="status">
        <div class="empty-glyph" aria-hidden="true">✧</div>
        <strong>Pledge board quiet</strong>
        <span class="muted small">Seal an amount into the tip jar to publish a public commitment — exact ADA stays veiled until you disclose. LOCAL-TRUE · not on-chain.</span>
        <button type="button" class="btn ghost small" id="empty-focus-amount">Compose a pledge</button>
      </li>`;
      queueMicrotask(() => {
        document.getElementById("empty-focus-amount")?.addEventListener("click", () => {
          const el = document.getElementById("pledge-amount");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
          el?.focus();
        });
      });
      return;
    }

    list.innerHTML = pledges
      .map((p) => {
        const tagClass =
          p.disclosure === "sealed" ? "sealed" : p.disclosure === "range" ? "range" : "full";
        const tagLabel =
          p.disclosure === "sealed"
            ? "Sealed"
            : p.disclosure === "range"
              ? `≥ ${p.rangeMin} ADA`
              : "Full disclose";
        let body = "";
        if (p.disclosure === "full") {
          body = `<p class="pledge-body"><strong>${escapeHtml(String(p.amount))} ADA</strong> — ${escapeHtml(p.note || "(no note)")}</p>`;
        } else if (p.disclosure === "range") {
          body = `<p class="pledge-body muted">Proved amount ≥ <strong>${escapeHtml(String(p.rangeMin))}</strong> ADA · exact tip still veiled</p>`;
        } else {
          body = `<p class="pledge-body muted">Amount &amp; note veiled — only the commitment is public.</p>`;
        }
        const cls =
          p.disclosure === "full" ? "is-disclosed" : p.disclosure === "range" ? "is-range" : "";
        return `<li class="pledge-item ${cls}" data-id="${escapeHtml(p.id)}">
          <div class="pledge-meta">
            <span class="pledge-tag ${tagClass}">${tagLabel}</span>
            <span>${escapeHtml(p.handle || "@anon")}</span>
            <span>${new Date(p.createdAt).toLocaleString()}</span>
          </div>
          <div class="pledge-commit">${escapeHtml(p.commitment)}</div>
          ${body}
          <div class="pledge-actions btn-row">
            <button type="button" class="btn ghost small" data-act="select" data-id="${escapeHtml(p.id)}">Use in threshold</button>
            ${
              p.disclosure !== "full"
                ? `<button type="button" class="btn ghost small" data-act="disclose" data-id="${escapeHtml(p.id)}">Full disclose</button>`
                : ""
            }
          </div>
        </li>`;
      })
      .join("");
  }

  function updateJar(sum) {
    const fill = document.getElementById("jar-fill");
    const label = document.getElementById("jar-label");
    const pct = Math.max(8, Math.min(92, 8 + (sum / 50) * 84));
    if (fill) fill.style.height = `${pct}%`;
    if (label) {
      label.textContent = pledges.length
        ? `${sum.toFixed(2)} ADA · ${pledges.length} local pledge(s)`
        : "0 ADA · empty";
    }
  }

  async function sealDraft() {
    const amountEl = document.getElementById("pledge-amount");
    const noteEl = document.getElementById("pledge-note");
    const handleEl = document.getElementById("pledge-handle");
    const amount = Number(amountEl instanceof HTMLInputElement ? amountEl.value : 0);
    const note = noteEl instanceof HTMLTextAreaElement ? noteEl.value.trim() : "";
    const handle = handleEl instanceof HTMLInputElement ? handleEl.value.trim() || "@anon" : "@anon";

    if (!Number.isFinite(amount) || amount < 0.1) {
      setStatus("seal-status", "Amount must be ≥ 0.1 ADA (stub).", "fail");
      setPledgeError("Amount must be a positive number — LOCAL-TRUE will not seal an empty or invalid tip.");
      setStatus("seal-status", "Seal rejected — invalid amount.", "warn");
      announce("Seal rejected — invalid amount");
      document.getElementById("pledge-amount")?.focus();
      document.getElementById("btn-seal")?.classList.add("shake-err");
      setTimeout(() => document.getElementById("btn-seal")?.classList.remove("shake-err"), 450);
      return;
    }

    setPledgeError("");
    const salt = randomHex(32);
    const commitment = await commitHash(amount, note, salt);
    draft = { amount, note, handle, salt, commitment };
    saveDraft();
    renderDraftPreview();
    setStatus("seal-status", `Sealed. Commitment ${short(commitment)}. Ready to commit.`, "ok");
    setJourney("sealed", "Phase: sealed — private vault holds amount + salt.");
    announce("Pledge sealed into private vault");
    pushThreshLog(`Sealed draft ${short(commitment)} (amount veiled).`);
    document.getElementById("btn-seal")?.classList.add("seal-flash");
    setTimeout(() => document.getElementById("btn-seal")?.classList.remove("seal-flash"), 600);
  }

  function commitDraft() {
    if (!draft) {
      setStatus("commit-status", "No sealed draft.", "fail");
      return;
    }
    if (pledges.some((p) => p.commitment === draft.commitment)) {
      setStatus("commit-status", "This commitment is already on the board.", "warn");
      return;
    }
    const entry = {
      id: randomHex(8),
      handle: draft.handle,
      commitment: draft.commitment,
      salt: draft.salt,
      amount: draft.amount,
      note: draft.note,
      createdAt: new Date().toISOString(),
      disclosure: /** @type {'sealed'} */ ("sealed"),
    };
    pledges.unshift(entry);
    savePledges();
    draft = null;
    saveDraft();
    renderDraftPreview();
    renderBoard();
    setStatus("commit-status", `Committed ${short(entry.commitment)} to public board.`, "ok");
    setJourney("committed", "Phase: committed — public hash on ledger, amount veiled.");
    announce("Pledge committed to public board");
    pushThreshLog(`Committed ${short(entry.commitment)} — public hash only.`);
  }

  function clearDraft() {
    draft = null;
    saveDraft();
    renderDraftPreview();
    setStatus("seal-status", "Draft cleared.", "");
    setStatus("commit-status", "Seal first, then commit.", "");
    syncJourneyFromState();
    announce("Draft cleared");
  }

  function proveThreshold() {
    const sel = document.getElementById("thresh-pledge");
    const thrEl = document.getElementById("thresh-value");
    const id = sel instanceof HTMLSelectElement ? sel.value : "";
    const threshold = Number(thrEl instanceof HTMLInputElement ? thrEl.value : 0);
    const p = pledges.find((x) => x.id === id);

    if (!p) {
      setStatus("thresh-status", "Select a committed pledge.", "fail");
      setProofResult("REJECT — no pledge", "fail");
      announce("Threshold proof rejected — no pledge selected. Honest miss · LOCAL-TRUE.");
      return;
    }
    if (!Number.isFinite(threshold) || threshold <= 0) {
      setStatus("thresh-status", "Threshold must be > 0.", "fail");
      setProofResult("REJECT — bad threshold", "fail");
      return;
    }

    // Simulated circuit: witness amount vs public threshold claim.
    // Single-source the core predicate — it requires a positive finite
    // amount on both sides, so a hostile amount can never prove.
    const ok = proveThresholdCore(p, threshold).ok;
    pushThreshLog(
      `Prove amount ≥ ${threshold} against ${short(p.commitment)} … ${ok ? "ACCEPT" : "REJECT"}`
    );

    if (!ok) {
      setStatus(
        "thresh-status",
        `Reject: vault amount cannot satisfy ≥ ${threshold} ADA. Exact amount still veiled.`,
        "fail"
      );
      setProofResult("REJECT", "fail");
      announce("Threshold proof rejected — amount below threshold (still veiled). Honest fail.");
      return;
    }

    p.disclosure = "range";
    p.rangeMin = threshold;
    savePledges();
    renderBoard();
    setStatus(
      "thresh-status",
      `Accept: proved ≥ ${threshold} ADA without revealing exact tip.`,
      "ok"
    );
    setProofResult(`ACCEPT ≥ ${threshold} ADA`, "ok");
    setJourney("disclosed", `Phase: disclosed — range proof ≥ ${threshold} ADA.`);
    announce(`Threshold proof accepted: ≥ ${threshold} ADA`);
  }

  function fullDisclose(id) {
    const p = pledges.find((x) => x.id === id);
    if (!p) return;
    p.disclosure = "full";
    delete p.rangeMin;
    savePledges();
    renderBoard();
    pushThreshLog(`Full disclose ${short(p.commitment)} → ${p.amount} ADA.`);
    setStatus("thresh-status", `Full disclose: ${p.amount} ADA — "${p.note || ""}"`, "warn");
    setProofResult(`FULL · ${p.amount} ADA`, "ok");
    setJourney("disclosed", "Phase: disclosed — full amount & note revealed.");
    announce("Pledge fully disclosed");
  }

  function resealSelected() {
    const sel = document.getElementById("thresh-pledge");
    const id = sel instanceof HTMLSelectElement ? sel.value : "";
    const p = pledges.find((x) => x.id === id);
    if (!p) {
      setStatus("thresh-status", "Select a pledge to re-seal.", "fail");
      return;
    }
    p.disclosure = "sealed";
    delete p.rangeMin;
    savePledges();
    renderBoard();
    pushThreshLog(`Re-sealed ${short(p.commitment)} (local UI only).`);
    setStatus("thresh-status", "Re-sealed locally. Real ZK transcripts are append-only — this is UI theater.", "warn");
    setProofResult("RE-SEALED (UI)", "ok");
    syncJourneyFromState();
    announce("Pledge re-sealed in UI");
  }

  function setPledgeError(msg) {
    const el = document.getElementById("pledge-error");
    if (!el) return;
    if (!msg) { el.hidden = true; el.textContent = ""; return; }
    el.hidden = false;
    el.textContent = msg;
  }

    async function copyDonate(btn) {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1200);
      }
      announce("Donation address copied");
    } catch {
      announce("Copy failed — select the address manually");
    }
  }

  /* ---------- Starfield ---------- */
  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: Math.min(220, Math.max(60, n)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        s: Math.random() * 0.015 + 0.004,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const st of stars) {
        if (!reduced) {
          st.a += st.s;
          if (st.a > 1 || st.a < 0) st.s *= -1;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 220, 255, ${0.25 + st.a * 0.55})`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    toggle?.addEventListener("click", () => {
      const open = nav?.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  function initCompose() {
    const note = document.getElementById("pledge-note");
    const count = document.getElementById("note-count");
    const syncCount = () => {
      if (note instanceof HTMLTextAreaElement && count) {
        count.textContent = `${note.value.length} / 160`;
      }
    };
    note?.addEventListener("input", syncCount);
    syncCount();

    document.getElementById("btn-seal")?.addEventListener("click", () => {
      sealDraft().catch((e) => {
        setStatus("seal-status", String(e?.message || e), "fail");
      });
    });
    document.getElementById("btn-commit")?.addEventListener("click", commitDraft);
    document.getElementById("btn-clear-draft")?.addEventListener("click", clearDraft);
    document.getElementById("btn-copy-tip-target")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget);
    });
  }

  function initThreshold() {
    document.getElementById("btn-prove-thresh")?.addEventListener("click", proveThreshold);
    document.getElementById("btn-full-disclose")?.addEventListener("click", () => {
      const sel = document.getElementById("thresh-pledge");
      const id = sel instanceof HTMLSelectElement ? sel.value : "";
      if (!id) {
        setStatus("thresh-status", "Select a pledge first.", "fail");
        return;
      }
      fullDisclose(id);
    });
    document.getElementById("btn-reseal")?.addEventListener("click", resealSelected);
  }

  function initBoard() {
    document.getElementById("pledge-list")?.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest("button[data-act]");
      if (!(btn instanceof HTMLElement)) return;
      const id = btn.getAttribute("data-id");
      const act = btn.getAttribute("data-act");
      if (!id) return;
      if (act === "select") {
        const sel = document.getElementById("thresh-pledge");
        if (sel instanceof HTMLSelectElement) {
          sel.value = id;
          document.getElementById("threshold")?.scrollIntoView({ behavior: "smooth" });
          announce("Pledge selected for threshold theater");
        }
      } else if (act === "disclose") {
        fullDisclose(id);
      }
    });

    document.getElementById("btn-clear-board")?.addEventListener("click", () => {
      if (confirm("Clear all local pledges? Also clears exportable studio state.")) {
        pledges = [];
        draft = null;
        clearStudioState();
        persistDraft(null);
        tabSync?.broadcast(snapshotState());
        renderDraftPreview();
        renderBoard();
        pushThreshLog("Board cleared.");
        announce("Pledge board cleared");
      }
    });
  }

  function initPersistUi() {
    document.getElementById("btn-export")?.addEventListener("click", exportStudio);
    document.getElementById("btn-import")?.addEventListener("click", () => {
      document.getElementById("import-file")?.click();
    });
    document.getElementById("import-file")?.addEventListener("change", (e) => {
      const file = e.target?.files?.[0];
      importStudioFromFile(file).catch(console.error);
      e.target.value = "";
    });
  }

  function initDonate() {
    document.getElementById("dock-copy-addr")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget);
    });
    document.getElementById("copy-addr")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget);
    });
    document.getElementById("btn-copy-jar")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget);
      setStatus("jar-status", "Address copied — paste into Lace / any Cardano wallet.", "ok");
    });
  }

  function boot() {
    loadPledges();
    loadDraft();
    startTabSync();
    initStarfield();
    initNav();
    initCompose();
    initThreshold();
    initBoard();
    initPersistUi();
    initDonate();
    renderDraftPreview();
    renderBoard();
    pushThreshLog("Veil Pledge Studio ready · LOCAL-TRUE · not on-chain.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
