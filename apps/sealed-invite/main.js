/**
 * Sealed Invite Studio — private RSVP / sealed invites educational stub.
 * Dual-state: public title+commitment vs private capacity/venue/guests in localStorage.
 * Not a Compact runtime. Not on-chain. Not real ADA transfers. Not Pages-live claims.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "mn-sealed-invite-v1";
  const STORAGE_DRAFT = "mn-sealed-invite-draft-v1";
  const DOMAIN_INV = "sealed-invite:invite:v1";
  const DOMAIN_RSVP = "sealed-invite:rsvp:v1";
  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";
  const RING_CIRC = 2 * Math.PI * 52;

  /** @typedef {{ id: string, name: string, plusOnes: number, tag: string, salt: string, commitment: string, createdAt: string, disclosure: 'sealed'|'range'|'full', admitted?: boolean }} Rsvp */
  /** @typedef {{ id: string, title: string, when: string, host: string, capacity: number, venue: string, salt: string, commitment: string, createdAt: string, status: 'open'|'closed', disclosure: 'sealed'|'range'|'full', rsvps: Rsvp[] }} Invite */

  /** @type {Invite[]} */
  let invites = [];

  /** @type {{ title: string, when: string, host: string, capacity: number, venue: string, salt: string, commitment: string } | null} */
  let draft = null;

  const theaterLog = [];

  function randomHex(bytes = 32) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function short(hex, n = 10) {
    if (!hex) return "—";
    return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-6)}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("is-show"), 2200);
  }

  function setStatus(id, text, kind = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `status${kind ? ` ${kind}` : ""}`;
  }

  async function inviteCommit(capacity, venue, salt) {
    const enc = new TextEncoder();
    const payload = `${DOMAIN_INV}|${Number(capacity)}|${venue}|${salt}`;
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(payload));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function rsvpCommit(name, plusOnes, inviteId, salt) {
    const enc = new TextEncoder();
    const payload = `${DOMAIN_RSVP}|${inviteId}|${name}|${Number(plusOnes)}|${salt}`;
    const digest = await crypto.subtle.digest("SHA-256", enc.encode(payload));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function seatsUsed(inv) {
    return (inv.rsvps || []).reduce((n, r) => n + 1 + (Number(r.plusOnes) || 0), 0);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      invites = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(invites)) invites = [];
    } catch {
      invites = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_DRAFT);
      draft = raw ? JSON.parse(raw) : null;
    } catch {
      draft = null;
    }
  }

  function saveDraft() {
    if (draft) localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft));
    else localStorage.removeItem(STORAGE_DRAFT);
  }

  function setJourney(phase, detail) {
    const order = ["idle", "sealed", "rsvping", "proven"];
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
        phase === "proven" ? " ok" : phase === "rsvping" || phase === "sealed" ? " warn" : ""
      }`;
    }
  }

  function syncRails() {
    const total = invites.length;
    const disclosed = invites.filter((i) => i.disclosure !== "sealed").length;
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
      total === 0 ? "100% veiled (no invites yet)" : `${sealedPct}% invites still sealed`
    );
    setMeter(
      "rail-disclose",
      discPct,
      "rail-disclose-label",
      total === 0 ? "0% disclosed" : `${discPct}% disclosed (range or full)`
    );
  }

  function syncJourneyFromState() {
    if (draft && !invites.some((i) => i.commitment === draft.commitment)) {
      setJourney("sealed", "Phase: sealed — draft ready to open on the board.");
      return;
    }
    if (invites.length === 0) {
      setJourney("idle", "Phase: idle — seal an invite to open the night list.");
      return;
    }
    const anyProven = invites.some(
      (i) => i.disclosure !== "sealed" || (i.rsvps || []).some((r) => r.admitted || r.disclosure !== "sealed")
    );
    const anyRsvp = invites.some((i) => i.rsvps && i.rsvps.length > 0);
    if (anyProven) {
      setJourney("proven", "Phase: proven — capacity proof or selective admit on at least one invite.");
    } else if (anyRsvp) {
      setJourney("rsvping", "Phase: RSVPing — sealed guests on one or more invites.");
    } else {
      setJourney("sealed", "Phase: sealed — public titles + commitments on the board.");
    }
  }

  function renderDraftPreview() {
    const saltEl = document.getElementById("prev-salt");
    const commitEl = document.getElementById("prev-commit");
    const capEl = document.getElementById("prev-capacity");
    const venueEl = document.getElementById("prev-venue");
    const btn = document.getElementById("btn-open-invite");

    if (!draft) {
      if (saltEl) saltEl.textContent = "—";
      if (commitEl) commitEl.textContent = "—";
      if (capEl) capEl.textContent = "—";
      if (venueEl) venueEl.textContent = "—";
      if (btn) btn.disabled = true;
      return;
    }
    if (saltEl) saltEl.textContent = short(draft.salt, 12);
    if (commitEl) commitEl.textContent = draft.commitment;
    if (capEl) capEl.textContent = `${draft.capacity} seats (private)`;
    if (venueEl) venueEl.textContent = draft.venue || "(empty)";
    if (btn) btn.disabled = false;
  }

  function pushLog(line) {
    const stamp = new Date().toLocaleTimeString();
    theaterLog.unshift(`[${stamp}] ${line}`);
    if (theaterLog.length > 40) theaterLog.length = 40;
    const el = document.getElementById("theater-log");
    if (el) el.textContent = theaterLog.join("\n");
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

  function updateRing(inv) {
    const fg = document.getElementById("ring-fg");
    const pctEl = document.getElementById("ring-pct");
    const subEl = document.getElementById("ring-sub");
    if (!fg || !pctEl || !subEl) return;
    if (!inv) {
      fg.setAttribute("stroke-dashoffset", String(RING_CIRC));
      pctEl.textContent = "—";
      subEl.textContent = "no invite";
      return;
    }
    if (inv.disclosure === "sealed") {
      fg.setAttribute("stroke-dashoffset", String(RING_CIRC * 0.15));
      pctEl.textContent = "██";
      subEl.textContent = "capacity sealed";
      return;
    }
    const used = seatsUsed(inv);
    const pct = Math.min(100, Math.round((used / inv.capacity) * 100));
    const offset = RING_CIRC * (1 - pct / 100);
    fg.setAttribute("stroke-dashoffset", String(offset));
    pctEl.textContent = `${pct}%`;
    subEl.textContent =
      inv.disclosure === "full"
        ? `${used}/${inv.capacity} seats`
        : "under capacity (range)";
  }

  function fillInviteSelects() {
    const open = invites.filter((i) => i.status === "open");
    const all = invites;
    const rsvpSel = document.getElementById("rsvp-invite");
    const thSel = document.getElementById("theater-invite");

    const fill = (sel, items, emptyLabel) => {
      if (!sel) return;
      const prev = sel.value;
      sel.innerHTML = "";
      if (items.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = emptyLabel;
        sel.appendChild(opt);
        return;
      }
      items.forEach((i) => {
        const opt = document.createElement("option");
        opt.value = i.id;
        opt.textContent = `${i.title} · ${short(i.commitment, 6)}`;
        sel.appendChild(opt);
      });
      if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
    };

    fill(rsvpSel, open, "No open invites — seal one first");
    fill(thSel, all, "No invites yet");
    fillTheaterRsvps();
    const thInv = invites.find((i) => i.id === thSel?.value);
    updateRing(thInv || null);
  }

  function fillTheaterRsvps() {
    const thSel = document.getElementById("theater-invite");
    const rsvpSel = document.getElementById("theater-rsvp");
    if (!rsvpSel) return;
    const iid = thSel?.value;
    const invite = invites.find((i) => i.id === iid);
    rsvpSel.innerHTML = "";
    if (!invite || !invite.rsvps.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No RSVPs on this invite";
      rsvpSel.appendChild(opt);
      return;
    }
    invite.rsvps.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = r.id;
      const tag = r.admitted ? " ★ admitted" : "";
      opt.textContent = `${r.tag} · ${short(r.commitment, 6)}${tag}`;
      rsvpSel.appendChild(opt);
    });
  }

  function formatWhen(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  function renderBoard() {
    const list = document.getElementById("invite-list");
    const sI = document.getElementById("stat-invites");
    const sR = document.getElementById("stat-rsvps");
    const sA = document.getElementById("stat-admitted");
    const totalR = invites.reduce((n, i) => n + (i.rsvps?.length || 0), 0);
    const admitted = invites.reduce(
      (n, i) => n + (i.rsvps || []).filter((r) => r.admitted).length,
      0
    );
    if (sI) sI.textContent = String(invites.length);
    if (sR) sR.textContent = String(totalR);
    if (sA) sA.textContent = String(admitted);

    if (!list) return;
    if (invites.length === 0) {
      list.innerHTML = `<li class="empty">No invites yet. Seal an invite or seed a demo.</li>`;
      return;
    }

    list.innerHTML = invites
      .slice()
      .reverse()
      .map((inv) => {
        const discClass =
          inv.disclosure === "full" ? "is-disclosed" : inv.disclosure === "range" ? "is-range" : "";
        const capPublic =
          inv.disclosure === "full"
            ? `${seatsUsed(inv)} / ${inv.capacity} seats`
            : inv.disclosure === "range"
              ? "Under capacity (proven)"
              : "██ / ██ seats (sealed)";
        const venuePublic =
          inv.disclosure === "full" ? escapeHtml(inv.venue || "(empty)") : "· sealed ·";
        const guestsHtml =
          (inv.rsvps || [])
            .map((r) => {
              const identity =
                r.disclosure === "full"
                  ? `${escapeHtml(r.name)} (+${r.plusOnes})`
                  : r.disclosure === "range"
                    ? "admitted · identity veiled"
                    : "sealed guest";
              return `<li class="guest-row${r.admitted ? " is-admitted" : ""}">
                <span class="pledge-tag ${r.disclosure}">${escapeHtml(r.disclosure)}</span>
                <strong>${escapeHtml(r.tag)}</strong>
                <span>${identity}</span>
                <span class="bid-commit">${escapeHtml(short(r.commitment, 8))}</span>
                ${r.admitted ? '<span class="badge badge-lab">admitted</span>' : ""}
              </li>`;
            })
            .join("") || `<li class="muted small">No RSVPs yet</li>`;

        return `<li class="pledge-item ${discClass}" data-id="${escapeHtml(inv.id)}">
          <div class="pledge-meta">
            <span class="pledge-tag ${inv.disclosure}">${escapeHtml(inv.disclosure)}</span>
            <span class="badge badge-lab">${escapeHtml(inv.status)}</span>
            <span>${escapeHtml(inv.host)}</span>
            <span>${escapeHtml(formatWhen(inv.when))}</span>
          </div>
          <p class="pledge-body"><strong>${escapeHtml(inv.title)}</strong></p>
          <p class="pledge-commit">commit ${escapeHtml(inv.commitment)}</p>
          <p class="muted small">Capacity: ${capPublic} · Venue: ${venuePublic}</p>
          <ul class="stall-bids">${guestsHtml}</ul>
        </li>`;
      })
      .join("");
  }

  function refreshAll() {
    renderDraftPreview();
    fillInviteSelects();
    renderBoard();
    syncRails();
    syncJourneyFromState();
  }

  async function sealInvite() {
    const title = /** @type {HTMLInputElement} */ (document.getElementById("inv-title"))?.value.trim();
    const when = /** @type {HTMLInputElement} */ (document.getElementById("inv-when"))?.value || "";
    const host =
      /** @type {HTMLInputElement} */ (document.getElementById("inv-host"))?.value.trim() || "@host";
    const capRaw = /** @type {HTMLInputElement} */ (document.getElementById("inv-capacity"))?.value;
    const venue = /** @type {HTMLTextAreaElement} */ (document.getElementById("inv-venue"))?.value.trim() || "";
    const capacity = Number(capRaw);

    if (!title) {
      setStatus("seal-status", "Event title is required (public).", "fail");
      announce("Title required");
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1 || !Number.isInteger(capacity)) {
      setStatus("seal-status", "Capacity must be a positive whole number.", "fail");
      announce("Invalid capacity");
      return;
    }

    const salt = randomHex(32);
    const commitment = await inviteCommit(capacity, venue, salt);
    draft = { title, when, host, capacity, venue, salt, commitment };
    saveDraft();
    renderDraftPreview();
    setStatus("seal-status", "Sealed in vault. Open the invite to publish title + commitment.", "ok");
    announce("Invite sealed in private vault");
    toast("Invite sealed");
    setJourney("sealed", "Phase: sealed — draft ready to open on the board.");
  }

  function clearDraft() {
    draft = null;
    saveDraft();
    ["inv-title", "inv-when", "inv-capacity", "inv-venue", "inv-host"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) /** @type {HTMLInputElement} */ (el).value = "";
    });
    const vc = document.getElementById("venue-count");
    if (vc) vc.textContent = "0";
    renderDraftPreview();
    setStatus("seal-status", "Draft cleared.", "");
    announce("Draft cleared");
    syncJourneyFromState();
  }

  function openInvite() {
    if (!draft) return;
    if (invites.some((i) => i.commitment === draft.commitment)) {
      setStatus("seal-status", "This commitment is already on the board.", "warn");
      return;
    }
    /** @type {Invite} */
    const invite = {
      id: `inv_${randomHex(8)}`,
      title: draft.title,
      when: draft.when,
      host: draft.host,
      capacity: draft.capacity,
      venue: draft.venue,
      salt: draft.salt,
      commitment: draft.commitment,
      createdAt: new Date().toISOString(),
      status: "open",
      disclosure: "sealed",
      rsvps: [],
    };
    invites.push(invite);
    save();
    draft = null;
    saveDraft();
    setStatus("seal-status", "Invite opened — public title + commitment only.", "ok");
    announce("Invite opened on the board");
    toast("Invite on board");
    pushLog(`INVITE open "${invite.title}" commit=${short(invite.commitment)}`);
    refreshAll();
  }

  async function sealRsvp() {
    const iid = /** @type {HTMLSelectElement} */ (document.getElementById("rsvp-invite"))?.value;
    const name = /** @type {HTMLInputElement} */ (document.getElementById("rsvp-name"))?.value.trim();
    const plusRaw = /** @type {HTMLInputElement} */ (document.getElementById("rsvp-plus"))?.value;
    const tag =
      /** @type {HTMLInputElement} */ (document.getElementById("rsvp-tag"))?.value.trim() || "@guest";
    const plusOnes = Number(plusRaw) || 0;
    const invite = invites.find((i) => i.id === iid);

    if (!invite || invite.status !== "open") {
      setStatus("rsvp-status", "Pick an open invite.", "fail");
      return;
    }
    if (!name) {
      setStatus("rsvp-status", "Guest name is required (stays private).", "fail");
      return;
    }
    if (!Number.isFinite(plusOnes) || plusOnes < 0 || !Number.isInteger(plusOnes)) {
      setStatus("rsvp-status", "Plus-ones must be a non-negative integer.", "fail");
      return;
    }

    const salt = randomHex(32);
    const commitment = await rsvpCommit(name, plusOnes, invite.id, salt);
    /** @type {Rsvp} */
    const rsvp = {
      id: `rsvp_${randomHex(8)}`,
      name,
      plusOnes,
      tag,
      salt,
      commitment,
      createdAt: new Date().toISOString(),
      disclosure: "sealed",
    };
    invite.rsvps.push(rsvp);
    save();
    setStatus("rsvp-status", `RSVP sealed for "${invite.title}". Identity stays in vault.`, "ok");
    announce("Private RSVP submitted");
    toast("RSVP sealed");
    pushLog(`RSVP ${tag} → "${invite.title}" commit=${short(commitment)}`);
    const nameEl = document.getElementById("rsvp-name");
    if (nameEl) /** @type {HTMLInputElement} */ (nameEl).value = "";
    refreshAll();
  }

  function proveCapacity() {
    const iid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-invite"))?.value;
    const invite = invites.find((i) => i.id === iid);
    if (!invite) {
      setProofResult("Select an invite.", "fail");
      pushLog("PROVE reject — missing invite");
      announce("Proof rejected: missing invite");
      return;
    }
    const used = seatsUsed(invite);
    const ok = used <= invite.capacity;
    if (ok) {
      if (invite.disclosure === "sealed") invite.disclosure = "range";
      save();
      setProofResult(`PASS — seats remain (capacity + count veiled). SIMULATED.`, "ok");
      pushLog(
        `PROVE PASS "${invite.title}" · used≤capacity (exact seats not published)`
      );
      announce("Simulated proof passed: seats remain");
      toast("Capacity proof PASS");
    } else {
      setProofResult(`FAIL — over capacity. Reject is first-class. SIMULATED.`, "fail");
      pushLog(`PROVE FAIL "${invite.title}" · used > capacity`);
      announce("Simulated proof failed: over capacity");
      toast("Capacity proof FAIL");
    }
    refreshAll();
  }

  function admitGuest() {
    const iid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-invite"))?.value;
    const rid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-rsvp"))?.value;
    const invite = invites.find((i) => i.id === iid);
    const rsvp = invite?.rsvps.find((r) => r.id === rid);
    if (!invite || !rsvp) {
      setProofResult("Select invite + RSVP to admit.", "fail");
      return;
    }
    const used = seatsUsed(invite);
    if (used > invite.capacity) {
      setProofResult("Cannot admit — invite over capacity. Prove first or cull RSVPs.", "fail");
      pushLog(`ADMIT reject ${rsvp.tag} — over capacity`);
      announce("Admit rejected: over capacity");
      refreshAll();
      return;
    }
    rsvp.admitted = true;
    rsvp.disclosure = rsvp.disclosure === "full" ? "full" : "range";
    if (invite.disclosure === "sealed") invite.disclosure = "range";
    save();
    setProofResult(`Admitted ${rsvp.tag}. Identity still veiled (range). SIMULATED.`, "ok");
    pushLog(`ADMIT "${invite.title}" → ${rsvp.tag}`);
    announce(`Guest ${rsvp.tag} admitted`);
    toast(`Admitted ${rsvp.tag}`);
    refreshAll();
  }

  function discloseFull() {
    const iid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-invite"))?.value;
    const invite = invites.find((i) => i.id === iid);
    if (!invite) {
      setProofResult("Select an invite to disclose.", "fail");
      return;
    }
    invite.disclosure = "full";
    invite.rsvps.forEach((r) => {
      r.disclosure = "full";
    });
    save();
    setProofResult("FULL DISCLOSE — capacity + all guest names now visible. SIMULATED.", "fail");
    pushLog(`DISCLOSE FULL "${invite.title}" — privacy rail dropped`);
    announce("Full disclose applied — guest list visible on board");
    toast("Full disclose — privacy dropped");
    refreshAll();
  }

  async function seedDemo() {
    const salt = randomHex(32);
    const capacity = 8;
    const venue = "Demo loft — private door code 042";
    const commitment = await inviteCommit(capacity, venue, salt);
    const when = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
    /** @type {Invite} */
    const invite = {
      id: `inv_${randomHex(8)}`,
      title: "Aurora salon (demo invite)",
      when,
      host: "@demo-host",
      capacity,
      venue,
      salt,
      commitment,
      createdAt: new Date().toISOString(),
      status: "open",
      disclosure: "sealed",
      rsvps: [],
    };
    const r1Salt = randomHex(32);
    const r1Commit = await rsvpCommit("Nova Vale", 1, invite.id, r1Salt);
    invite.rsvps.push({
      id: `rsvp_${randomHex(8)}`,
      name: "Nova Vale",
      plusOnes: 1,
      tag: "@nova",
      salt: r1Salt,
      commitment: r1Commit,
      createdAt: new Date().toISOString(),
      disclosure: "sealed",
    });
    const r2Salt = randomHex(32);
    const r2Commit = await rsvpCommit("Lowball Guest", 6, invite.id, r2Salt);
    invite.rsvps.push({
      id: `rsvp_${randomHex(8)}`,
      name: "Lowball Guest",
      plusOnes: 6,
      tag: "@crowded",
      salt: r2Salt,
      commitment: r2Commit,
      createdAt: new Date().toISOString(),
      disclosure: "sealed",
    });
    invites.push(invite);
    save();
    pushLog(`SEED demo invite "${invite.title}" with 2 sealed RSVPs`);
    announce("Demo invite seeded");
    toast("Demo invite seeded");
    refreshAll();
  }

  function resetStudio() {
    if (!confirm("Reset the entire Sealed Invite studio? This clears localStorage for this app.")) return;
    invites = [];
    draft = null;
    save();
    saveDraft();
    theaterLog.length = 0;
    const log = document.getElementById("theater-log");
    if (log) log.textContent = "Awaiting proofs…";
    setProofResult("No proof yet", "");
    announce("Studio reset");
    toast("Studio reset");
    refreshAll();
  }

  async function copyAddr(btnId, statusId) {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      if (statusId) setStatus(statusId, "Address copied.", "ok");
      announce("Donation address copied");
      toast("ADA address copied");
      const btn = document.getElementById(btnId);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1600);
      }
    } catch {
      if (statusId) setStatus(statusId, "Copy failed — select the address manually.", "fail");
    }
  }

  function initStarfield() {
    const canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById("starfield"));
    if (!canvas) return;
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
      const count = Math.floor((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: Math.max(40, Math.min(count, 160)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.6 + 0.2,
        s: Math.random() * 0.25 + 0.05,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const st of stars) {
        if (!reduced) {
          st.y += st.s;
          if (st.y > window.innerHeight) {
            st.y = 0;
            st.x = Math.random() * window.innerWidth;
          }
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(199, 210, 254, ${st.a})`;
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
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setHelpOpen(open) {
    const overlay = document.getElementById("help-overlay");
    if (!overlay) return;
    if (open) {
      overlay.hidden = false;
      overlay.classList.add("is-open");
      document.getElementById("btn-close-help")?.focus();
    } else {
      overlay.classList.remove("is-open");
      overlay.hidden = true;
    }
  }

  function initKeyboard() {
    document.addEventListener("keydown", (e) => {
      const t = e.target;
      const typing =
        t instanceof HTMLElement &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
      if (e.key === "Escape") {
        setHelpOpen(false);
        return;
      }
      if (typing) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        const overlay = document.getElementById("help-overlay");
        setHelpOpen(!overlay?.classList.contains("is-open"));
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        document.getElementById("inv-title")?.focus();
        document.getElementById("seal")?.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("Focus: seal form");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        document.getElementById("rsvp-name")?.focus();
        document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
        toast("Focus: RSVP form");
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        copyAddr("dock-copy-addr", "donate-status");
      } else if (e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        seedDemo().catch(console.error);
      }
    });
  }

  function bind() {
    document.getElementById("btn-seal-invite")?.addEventListener("click", () => {
      sealInvite().catch((e) => setStatus("seal-status", String(e), "fail"));
    });
    document.getElementById("btn-clear-draft")?.addEventListener("click", clearDraft);
    document.getElementById("btn-open-invite")?.addEventListener("click", openInvite);
    document.getElementById("btn-seal-rsvp")?.addEventListener("click", () => {
      sealRsvp().catch((e) => setStatus("rsvp-status", String(e), "fail"));
    });
    document.getElementById("btn-prove")?.addEventListener("click", proveCapacity);
    document.getElementById("btn-admit")?.addEventListener("click", admitGuest);
    document.getElementById("btn-disclose-full")?.addEventListener("click", discloseFull);
    document.getElementById("btn-seed")?.addEventListener("click", () => {
      seedDemo().catch(console.error);
    });
    document.getElementById("btn-reset")?.addEventListener("click", resetStudio);
    document.getElementById("btn-copy-donate")?.addEventListener("click", () =>
      copyAddr("btn-copy-donate", "donate-status")
    );
    document.getElementById("dock-copy-addr")?.addEventListener("click", () =>
      copyAddr("dock-copy-addr", "donate-status")
    );
    document.getElementById("theater-invite")?.addEventListener("change", () => {
      fillTheaterRsvps();
      const thSel = document.getElementById("theater-invite");
      const inv = invites.find((i) => i.id === /** @type {HTMLSelectElement} */ (thSel)?.value);
      updateRing(inv || null);
    });
    document.getElementById("btn-close-help")?.addEventListener("click", () => setHelpOpen(false));
    document.getElementById("help-overlay")?.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) setHelpOpen(false);
    });

    const venue = document.getElementById("inv-venue");
    const count = document.getElementById("venue-count");
    venue?.addEventListener("input", () => {
      if (count) count.textContent = String(/** @type {HTMLTextAreaElement} */ (venue).value.length);
    });
  }

  function boot() {
    load();
    loadDraft();
    initStarfield();
    initNav();
    initKeyboard();
    bind();
    refreshAll();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
