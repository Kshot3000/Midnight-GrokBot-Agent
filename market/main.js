/**
 * Night Market Studio — LOCAL-TRUE persistence.
 * Real localStorage, multi-tab sync, export/import.
 * Not Compact. Not on-chain. Not real ADA transfers.
 */
import {
  DONATE_ADDR,
  short,
  escapeHtml,
  listingCommit,
  bidCommit,
} from './market-core.mjs';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
  loadDraft as loadLegacyDraft,
  saveDraft as persistDraftKey,
} from './persist.mjs';


/** @typedef {{ id: string, amount: number, handle: string, salt: string, commitment: string, createdAt: string, disclosure: 'sealed'|'range'|'full', isWinner?: boolean }} Bid */
/** @typedef {{ id: string, title: string, category: string, seller: string, reserve: number, details: string, salt: string, commitment: string, createdAt: string, status: 'open'|'awarded', disclosure: 'sealed'|'range'|'full', bids: Bid[], winnerBidId?: string }} Listing */

/** @type {Listing[]} */
let listings = [];

/** @type {{ title: string, category: string, seller: string, reserve: number, details: string, salt: string, commitment: string } | null} */
let draft = null;

const theaterLog = [];

let tabSync = null;
let applyingRemote = false;

function snapshotState() {
  return { listings, draft };
}

function applyStudio(data, { announceRemote = false } = {}) {
  listings = Array.isArray(data?.listings) ? data.listings : [];
  draft = data?.draft && typeof data.draft === 'object' ? data.draft : null;
  if (announceRemote) announce('Synced from another tab');
}

function save() {
  if (applyingRemote) return;
  const saved = saveStudioState(snapshotState());
  persistDraftKey(draft);
  try {
    tabSync?.broadcast(saved);
  } catch (_) {}
}

function saveDraft() {
  persistDraftKey(draft);
  if (!applyingRemote) {
    const saved = saveStudioState(snapshotState());
    try {
      tabSync?.broadcast(saved);
    } catch (_) {}
  }
}

function load() {
  const state = loadStudioState();
  applyStudio(state);
  if (!draft) {
    const legacy = loadLegacyDraft();
    if (legacy) draft = legacy;
  }
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
  a.download = `night-market-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  announce('Studio exported as JSON');
  pushLog('export · local snapshot downloaded (sensitive)');
}

async function importStudioFromFile(file) {
  if (!file) return;
  const text = await file.text();
  const result = importStudioJSON(text);
  if (!result.ok) {
    announce(result.error || 'Import failed');
    return;
  }
  if (!window.confirm("Import replaces this tab's Night Market data. Continue?")) return;
  applyingRemote = true;
  try {
    applyStudio(result.state);
    saveStudioState(snapshotState());
    persistDraftKey(draft);
    tabSync?.broadcast(snapshotState());
  } finally {
    applyingRemote = false;
  }
  refreshAll();
  announce('Import applied — LOCAL educational data, not on-chain.');
  pushLog(`import · ${listings.length} item(s)`);
}


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







function setJourney(phase, detail) {
  const order = ["idle", "listed", "bidding", "awarded"];
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
      phase === "awarded" ? " ok" : phase === "bidding" ? " warn" : phase === "listed" ? " warn" : ""
    }`;
  }
}

function syncRails() {
  const total = listings.length;
  const disclosed = listings.filter((l) => l.disclosure !== "sealed").length;
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
    total === 0 ? "100% veiled (no stalls yet)" : `${sealedPct}% stalls still sealed`
  );
  setMeter(
    "rail-disclose",
    discPct,
    "rail-disclose-label",
    total === 0 ? "0% disclosed" : `${discPct}% disclosed (range or full)`
  );
}

function syncJourneyFromState() {
  if (draft && !listings.some((l) => l.commitment === draft.commitment)) {
    setJourney("listed", "Phase: listed — sealed draft ready to open on the board.");
    return;
  }
  if (listings.length === 0) {
    setJourney("idle", "Phase: idle — seal a listing to open the night market.");
    return;
  }
  const anyAwarded = listings.some((l) => l.status === "awarded");
  const anyBids = listings.some((l) => l.bids && l.bids.length > 0);
  if (anyAwarded) {
    setJourney("awarded", "Phase: awarded — at least one stall closed with a winner.");
  } else if (anyBids) {
    setJourney("bidding", "Phase: bidding — sealed bids on one or more stalls.");
  } else {
    setJourney("listed", "Phase: listed — public titles + commitments on the board.");
  }
}

function renderDraftPreview() {
  const saltEl = document.getElementById("prev-salt");
  const commitEl = document.getElementById("prev-commit");
  const reserveEl = document.getElementById("prev-reserve");
  const detailsEl = document.getElementById("prev-details");
  const btn = document.getElementById("btn-open-stall");

  if (!draft) {
    if (saltEl) saltEl.textContent = "—";
    if (commitEl) commitEl.textContent = "—";
    if (reserveEl) reserveEl.textContent = "—";
    if (detailsEl) detailsEl.textContent = "—";
    if (btn) btn.disabled = true;
    return;
  }
  if (saltEl) saltEl.textContent = short(draft.salt, 12);
  if (commitEl) commitEl.textContent = draft.commitment;
  if (reserveEl) reserveEl.textContent = `${draft.reserve.toFixed(2)} ADA (private)`;
  if (detailsEl) detailsEl.textContent = draft.details || "(empty)";
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

function fillListingSelects() {
  const open = listings.filter((l) => l.status === "open");
  const all = listings;
  const bidSel = document.getElementById("bid-listing");
  const thSel = document.getElementById("theater-listing");

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
    items.forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l.id;
      opt.textContent = `${l.title} · ${short(l.commitment, 6)}`;
      sel.appendChild(opt);
    });
    if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
  };

  fill(bidSel, open, "No open stalls — seal a listing first");
  fill(thSel, all, "No stalls yet");
  fillTheaterBids();
}

function fillTheaterBids() {
  const thSel = document.getElementById("theater-listing");
  const bidSel = document.getElementById("theater-bid");
  if (!bidSel) return;
  const lid = thSel?.value;
  const listing = listings.find((l) => l.id === lid);
  bidSel.innerHTML = "";
  if (!listing || !listing.bids.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No bids on this stall";
    bidSel.appendChild(opt);
    return;
  }
  listing.bids.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.id;
    const tag = b.isWinner ? " ★ winner" : "";
    opt.textContent = `${b.handle} · ${short(b.commitment, 6)}${tag}`;
    bidSel.appendChild(opt);
  });
}

function renderStalls() {
  const list = document.getElementById("stall-list");
  const sL = document.getElementById("stat-listings");
  const sB = document.getElementById("stat-bids");
  const sA = document.getElementById("stat-awarded");
  const totalBids = listings.reduce((n, l) => n + (l.bids?.length || 0), 0);
  const awarded = listings.filter((l) => l.status === "awarded").length;
  if (sL) sL.textContent = String(listings.length);
  if (sB) sB.textContent = String(totalBids);
  if (sA) sA.textContent = String(awarded);

  if (!list) return;
  if (listings.length === 0) {
    list.innerHTML = `<li class="empty">No stalls yet. Seal a listing or seed a demo stall.</li>`;
    return;
  }

  list.innerHTML = listings
    .slice()
    .reverse()
    .map((l) => {
      const discClass =
        l.disclosure === "full" ? "is-disclosed" : l.disclosure === "range" ? "is-range" : "";
      const tagClass = l.disclosure;
      const reservePublic =
        l.disclosure === "full"
          ? `${l.reserve.toFixed(2)} ADA`
          : l.disclosure === "range"
            ? "Reserve met by winner (range)"
            : "████.██ ADA (sealed)";
      const detailsPublic =
        l.disclosure === "full" ? escapeHtml(l.details || "(empty)") : "· sealed ·";
      const bidsHtml =
        (l.bids || [])
          .map((b) => {
            const amount =
              b.disclosure === "full"
                ? `${b.amount.toFixed(2)} ADA`
                : b.disclosure === "range"
                  ? "≥ reserve (proven)"
                  : "sealed amount";
            return `<li class="stall-bid${b.isWinner ? " is-winner" : ""}">
              <span class="pledge-tag ${b.disclosure}">${escapeHtml(b.disclosure)}</span>
              <strong>${escapeHtml(b.handle)}</strong>
              <span>${amount}</span>
              <span class="bid-commit">${escapeHtml(short(b.commitment, 8))}</span>
              ${b.isWinner ? '<span class="badge badge-lab">winner</span>' : ""}
            </li>`;
          })
          .join("") || `<li class="muted small">No bids yet</li>`;

      return `<li class="pledge-item ${discClass}" data-id="${escapeHtml(l.id)}">
        <div class="pledge-meta">
          <span class="pledge-tag ${tagClass}">${escapeHtml(l.disclosure)}</span>
          <span class="badge badge-lab">${escapeHtml(l.status)}</span>
          <span>${escapeHtml(l.category)}</span>
          <span>${escapeHtml(l.seller)}</span>
          <span>${new Date(l.createdAt).toLocaleString()}</span>
        </div>
        <p class="pledge-body"><strong>${escapeHtml(l.title)}</strong></p>
        <p class="pledge-commit">commit ${escapeHtml(l.commitment)}</p>
        <p class="muted small">Reserve: ${reservePublic} · Details: ${detailsPublic}</p>
        <ul class="stall-bids">${bidsHtml}</ul>
      </li>`;
    })
    .join("");
}

function refreshAll() {
  renderDraftPreview();
  fillListingSelects();
  renderStalls();
  syncRails();
  syncJourneyFromState();
}

async function sealListing() {
  const title = /** @type {HTMLInputElement} */ (document.getElementById("list-title"))?.value.trim();
  const category = /** @type {HTMLSelectElement} */ (document.getElementById("list-category"))?.value || "other";
  const seller =
    /** @type {HTMLInputElement} */ (document.getElementById("list-seller"))?.value.trim() || "@stall";
  const reserveRaw = /** @type {HTMLInputElement} */ (document.getElementById("list-reserve"))?.value;
  const details = /** @type {HTMLTextAreaElement} */ (document.getElementById("list-details"))?.value.trim() || "";
  const reserve = Number(reserveRaw);

  if (!title) {
    setStatus("list-status", "Title is required (public).", "fail");
    announce("Title required");
    return;
  }
  if (!Number.isFinite(reserve) || reserve <= 0) {
    setStatus("list-status", "Reserve must be a positive ADA amount.", "fail");
    announce("Invalid reserve");
    return;
  }

  const salt = randomHex(32);
  const commitment = await listingCommit(reserve, details, salt);
  draft = { title, category, seller, reserve, details, salt, commitment };
  saveDraft();
  renderDraftPreview();
  setStatus("list-status", "Sealed in vault. Open the stall to publish title + commitment.", "ok");
  announce("Listing sealed in private vault");
  setJourney("listed", "Phase: listed — sealed draft ready to open on the board.");
}

function clearDraft() {
  draft = null;
  saveDraft();
  const title = document.getElementById("list-title");
  const reserve = document.getElementById("list-reserve");
  const details = document.getElementById("list-details");
  const seller = document.getElementById("list-seller");
  if (title) /** @type {HTMLInputElement} */ (title).value = "";
  if (reserve) /** @type {HTMLInputElement} */ (reserve).value = "";
  if (details) /** @type {HTMLTextAreaElement} */ (details).value = "";
  if (seller) /** @type {HTMLInputElement} */ (seller).value = "";
  const dc = document.getElementById("details-count");
  if (dc) dc.textContent = "0";
  renderDraftPreview();
  setStatus("list-status", "Draft cleared.", "");
  announce("Draft cleared");
  syncJourneyFromState();
}

function openStall() {
  if (!draft) return;
  if (listings.some((l) => l.commitment === draft.commitment)) {
    setStatus("list-status", "This commitment is already on the board.", "warn");
    return;
  }
  /** @type {Listing} */
  const listing = {
    id: `lst_${randomHex(8)}`,
    title: draft.title,
    category: draft.category,
    seller: draft.seller,
    reserve: draft.reserve,
    details: draft.details,
    salt: draft.salt,
    commitment: draft.commitment,
    createdAt: new Date().toISOString(),
    status: "open",
    disclosure: "sealed",
    bids: [],
  };
  listings.push(listing);
  save();
  draft = null;
  saveDraft();
  setStatus("list-status", "Stall opened — public title + commitment only.", "ok");
  announce("Stall opened on the night market board");
  pushLog(`LIST open "${listing.title}" commit=${short(listing.commitment)}`);
  refreshAll();
}

async function sealBid() {
  const lid = /** @type {HTMLSelectElement} */ (document.getElementById("bid-listing"))?.value;
  const amountRaw = /** @type {HTMLInputElement} */ (document.getElementById("bid-amount"))?.value;
  const handle =
    /** @type {HTMLInputElement} */ (document.getElementById("bid-handle"))?.value.trim() || "@bidder";
  const amount = Number(amountRaw);
  const listing = listings.find((l) => l.id === lid);

  if (!listing || listing.status !== "open") {
    setStatus("bid-status", "Pick an open stall.", "fail");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    setStatus("bid-status", "Bid must be a positive ADA amount.", "fail");
    return;
  }

  const salt = randomHex(32);
  const commitment = await bidCommit(amount, listing.id, salt);
  /** @type {Bid} */
  const bid = {
    id: `bid_${randomHex(8)}`,
    amount,
    handle,
    salt,
    commitment,
    createdAt: new Date().toISOString(),
    disclosure: "sealed",
  };
  listing.bids.push(bid);
  save();
  setStatus("bid-status", `Bid sealed for "${listing.title}". Amount stays in vault.`, "ok");
  announce("Private bid submitted");
  pushLog(`BID ${handle} → "${listing.title}" commit=${short(commitment)}`);
  const amountEl = document.getElementById("bid-amount");
  if (amountEl) /** @type {HTMLInputElement} */ (amountEl).value = "";
  refreshAll();
}

function proveBid() {
  const lid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-listing"))?.value;
  const bidId = /** @type {HTMLSelectElement} */ (document.getElementById("theater-bid"))?.value;
  const listing = listings.find((l) => l.id === lid);
  const bid = listing?.bids.find((b) => b.id === bidId);
  if (!listing || !bid) {
    setProofResult("Select a listing and bid.", "fail");
    pushLog("PROVE reject — missing selection");
    announce("Proof rejected: missing selection");
    return;
  }
  const ok = bid.amount >= listing.reserve;
  if (ok) {
    bid.disclosure = bid.disclosure === "full" ? "full" : "range";
    if (listing.disclosure === "sealed") listing.disclosure = "range";
    save();
    setProofResult(`PASS — bid meets reserve (amounts veiled). SIMULATED.`, "ok");
    pushLog(
      `PROVE PASS ${bid.handle} on "${listing.title}" · bid≥reserve (exact amounts not published)`
    );
    announce("Simulated proof passed: bid meets reserve");
  } else {
    setProofResult(`FAIL — bid below reserve. Reject is first-class. SIMULATED.`, "fail");
    pushLog(`PROVE FAIL ${bid.handle} on "${listing.title}" · bid < reserve`);
    announce("Simulated proof failed: bid below reserve");
  }
  refreshAll();
}

function awardBid() {
  const lid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-listing"))?.value;
  const bidId = /** @type {HTMLSelectElement} */ (document.getElementById("theater-bid"))?.value;
  const listing = listings.find((l) => l.id === lid);
  const bid = listing?.bids.find((b) => b.id === bidId);
  if (!listing || !bid) {
    setStatus("bid-status", "Select listing + bid to award.", "fail");
    return;
  }
  if (bid.amount < listing.reserve) {
    setProofResult("Cannot award — bid below reserve. Prove first or pick another.", "fail");
    pushLog(`AWARD reject ${bid.handle} — below reserve`);
    announce("Award rejected: bid below reserve");
    refreshAll();
    return;
  }
  listing.bids.forEach((b) => {
    b.isWinner = b.id === bid.id;
  });
  listing.status = "awarded";
  listing.winnerBidId = bid.id;
  bid.disclosure = bid.disclosure === "full" ? "full" : "range";
  if (listing.disclosure === "sealed") listing.disclosure = "range";
  save();
  setProofResult(`Awarded to ${bid.handle}. Range disclose only. SIMULATED.`, "ok");
  pushLog(`AWARD "${listing.title}" → ${bid.handle}`);
  announce(`Stall awarded to ${bid.handle}`);
  refreshAll();
}

function discloseFull() {
  const lid = /** @type {HTMLSelectElement} */ (document.getElementById("theater-listing"))?.value;
  const listing = listings.find((l) => l.id === lid);
  if (!listing) {
    setProofResult("Select a listing to disclose.", "fail");
    return;
  }
  listing.disclosure = "full";
  listing.bids.forEach((b) => {
    b.disclosure = "full";
  });
  save();
  setProofResult("FULL DISCLOSE — reserve + all bid amounts now visible. SIMULATED.", "fail");
  pushLog(`DISCLOSE FULL "${listing.title}" — privacy rail dropped`);
  announce("Full disclose applied — amounts visible on board");
  refreshAll();
}

async function seedDemo() {
  const salt = randomHex(32);
  const reserve = 25;
  const details = "Demo lantern — private SKU LAN-042";
  const commitment = await listingCommit(reserve, details, salt);
  const listing = {
    id: `lst_${randomHex(8)}`,
    title: "Aurora lantern (demo stall)",
    category: "artifact",
    seller: "@demo-stall",
    reserve,
    details,
    salt,
    commitment,
    createdAt: new Date().toISOString(),
    status: "open",
    disclosure: "sealed",
    bids: [],
  };
  const bSalt = randomHex(32);
  const bidAmt = 40;
  const bCommit = await bidCommit(bidAmt, listing.id, bSalt);
  listing.bids.push({
    id: `bid_${randomHex(8)}`,
    amount: bidAmt,
    handle: "@nightwalker",
    salt: bSalt,
    commitment: bCommit,
    createdAt: new Date().toISOString(),
    disclosure: "sealed",
  });
  const bSalt2 = randomHex(32);
  const bidAmt2 = 18;
  const bCommit2 = await bidCommit(bidAmt2, listing.id, bSalt2);
  listing.bids.push({
    id: `bid_${randomHex(8)}`,
    amount: bidAmt2,
    handle: "@lowball",
    salt: bSalt2,
    commitment: bCommit2,
    createdAt: new Date().toISOString(),
    disclosure: "sealed",
  });
  listings.push(listing);
  save();
  pushLog(`SEED demo stall "${listing.title}" with 2 sealed bids`);
  announce("Demo stall seeded");
  refreshAll();
}

function resetMarket() {
  if (!confirm("Reset Night Market Studio? Clears localStorage for this app.")) return;
  clearStudioState();
  listings = [];
  draft = null;
  theaterLog.length = 0;
  const log = document.getElementById("theater-log");
  if (log) log.textContent = "Awaiting proofs…";
  setProofResult("No proof yet", "");
  save();
  announce("Studio reset");
  refreshAll();
}


async function copyAddr(btnId, statusId) {
  try {
    await navigator.clipboard.writeText(DONATE_ADDR);
    if (statusId) setStatus(statusId, "Address copied.", "ok");
    announce("Donation address copied");
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

function bind() {
  document.getElementById("btn-seal-listing")?.addEventListener("click", () => {
    sealListing().catch((e) => setStatus("list-status", String(e), "fail"));
  });
  document.getElementById("btn-clear-draft")?.addEventListener("click", clearDraft);
  document.getElementById("btn-open-stall")?.addEventListener("click", openStall);
  document.getElementById("btn-seal-bid")?.addEventListener("click", () => {
    sealBid().catch((e) => setStatus("bid-status", String(e), "fail"));
  });
  document.getElementById("btn-prove")?.addEventListener("click", proveBid);
  document.getElementById("btn-award")?.addEventListener("click", awardBid);
  document.getElementById("btn-disclose-full")?.addEventListener("click", discloseFull);
  document.getElementById("btn-seed")?.addEventListener("click", () => {
    seedDemo().catch(console.error);
  });
  document.getElementById("btn-reset")?.addEventListener("click", resetMarket);
  document.getElementById("btn-export")?.addEventListener("click", exportStudio);
  document.getElementById("btn-import")?.addEventListener("click", () => {
    document.getElementById("import-file")?.click();
  });
  document.getElementById("import-file")?.addEventListener("change", (e) => {
    const file = e.target?.files?.[0];
    importStudioFromFile(file).catch(console.error);
    e.target.value = "";
  });
  document.getElementById("btn-copy-donate")?.addEventListener("click", () =>
    copyAddr("btn-copy-donate", "donate-status")
  );
  document.getElementById("dock-copy-addr")?.addEventListener("click", () =>
    copyAddr("dock-copy-addr", "donate-status")
  );
  document.getElementById("theater-listing")?.addEventListener("change", fillTheaterBids);

  const details = document.getElementById("list-details");
  const count = document.getElementById("details-count");
  details?.addEventListener("input", () => {
    if (count) count.textContent = String(/** @type {HTMLTextAreaElement} */ (details).value.length);
  });
}

function boot() {
  load();
  startTabSync();
  initStarfield();
  initNav();
  bind();
  refreshAll();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
