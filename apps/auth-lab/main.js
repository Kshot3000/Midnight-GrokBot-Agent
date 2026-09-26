/**
 * MPS-0029 Auth Lab — local educational stub.
 * Simulates forgeable ownPublicKey auth vs witness-derived binding.
 * Not a Compact runtime. Not on-chain.
 */

const STORAGE_SK = "mn-auth-lab-sk-v1";
const STORAGE_POSTS = "mn-auth-lab-posts-v1";

/** @type {{ ownerPk: string | null, log: string[] }} */
const unsafe = { ownerPk: null, log: [] };

/** @type {{ ownerDerived: string | null, aliceSk: string | null }} */
const safe = { ownerDerived: null, aliceSk: null };

function randomHex(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Lightweight domain-separated "publicKey" for the stub (not Compact crypto). */
async function derivePk(secretHex, domain = "auth-lab:pk:v1") {
  const enc = new TextEncoder();
  const data = enc.encode(`${domain}:${secretHex}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function short(hex, n = 10) {
  if (!hex) return "—";
  return hex.length <= n * 2 ? hex : `${hex.slice(0, n)}…${hex.slice(-6)}`;
}

function pushLog(line) {
  const stamp = new Date().toLocaleTimeString();
  unsafe.log.unshift(`[${stamp}] ${line}`);
  if (unsafe.log.length > 30) unsafe.log.length = 30;
  const el = document.getElementById("forge-log");
  if (el) el.textContent = unsafe.log.join("\n");
}

function setStatus(id, text, kind = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `status${kind ? ` ${kind}` : ""}`;
}

/* ---------- Forge demo ---------- */
function initForge() {
  const aliceInput = document.getElementById("alice-pk");
  const malloryInput = document.getElementById("mallory-claim");
  if (aliceInput && !aliceInput.value) aliceInput.value = randomHex(32);

  document.getElementById("btn-deploy")?.addEventListener("click", () => {
    const pk = (aliceInput?.value || "").trim().toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(pk)) {
      setStatus("deploy-status", "Need 32-byte hex (64 chars).", "fail");
      return;
    }
    unsafe.ownerPk = pk;
    setStatus("deploy-status", `Deployed. owner = ${short(pk)}`, "ok");
    pushLog(`UNSAFE deploy: owner ← ${short(pk)} (claimed ownPublicKey)`);
  });

  document.getElementById("btn-copy-alice")?.addEventListener("click", () => {
    if (malloryInput && unsafe.ownerPk) {
      malloryInput.value = unsafe.ownerPk;
      setStatus("forge-status", "Claim field set to Alice’s stored owner pk.", "warn");
    }
  });

  document.getElementById("btn-forge")?.addEventListener("click", () => {
    if (!unsafe.ownerPk) {
      setStatus("forge-status", "Deploy first.", "fail");
      return;
    }
    const claim = (malloryInput?.value || "").trim().toLowerCase();
    // Simulated assert(ownPublicKey() == owner)
    if (claim === unsafe.ownerPk) {
      setStatus("forge-status", "PASS — Mallory forged Alice’s ownPublicKey. Admin gate bypassed.", "fail");
      pushLog(`FORGE SUCCESS: assert(ownPublicKey()==owner) held for Mallory claim ${short(claim)}`);
    } else {
      setStatus("forge-status", "Reject — claim ≠ owner (Mallory forgot to forge).", "ok");
      pushLog(`Forge failed: claim ${short(claim)} ≠ owner ${short(unsafe.ownerPk)}`);
    }
  });

  document.getElementById("btn-safe-deploy")?.addEventListener("click", async () => {
    safe.aliceSk = randomHex(32);
    safe.ownerDerived = await derivePk(safe.aliceSk);
    setStatus("safe-status", `Safe deploy. owner = derive(Alice.sk) → ${short(safe.ownerDerived)}`, "ok");
    pushLog(`SAFE deploy: owner ← derive(sk) ${short(safe.ownerDerived)} (sk stays local)`);
  });

  document.getElementById("btn-safe-forge")?.addEventListener("click", async () => {
    if (!safe.ownerDerived) {
      setStatus("safe-status", "Safe-deploy first.", "fail");
      return;
    }
    const mallorySk = randomHex(32);
    const malloryDerived = await derivePk(mallorySk);
    if (malloryDerived === safe.ownerDerived) {
      setStatus("safe-status", "Unexpected collision — rotate and retry.", "warn");
    } else {
      setStatus("safe-status", `REJECT — Mallory derive ${short(malloryDerived)} ≠ owner. Auth holds.`, "ok");
      pushLog(`SAFE reject: Mallory cannot match owner without Alice’s secret`);
    }
  });

  document.getElementById("btn-safe-alice")?.addEventListener("click", async () => {
    if (!safe.aliceSk || !safe.ownerDerived) {
      setStatus("safe-status", "Safe-deploy first.", "fail");
      return;
    }
    const again = await derivePk(safe.aliceSk);
    if (again === safe.ownerDerived) {
      setStatus("safe-status", `PASS — Alice proves knowledge of sk → ${short(again)}`, "ok");
      pushLog(`SAFE pass: Alice adminOnly() with witness-derived pk`);
    }
  });
}

/* ---------- Bulletin board ---------- */
function loadSk() {
  let sk = localStorage.getItem(STORAGE_SK);
  if (!sk || !/^[0-9a-f]{64}$/.test(sk)) {
    sk = randomHex(32);
    localStorage.setItem(STORAGE_SK, sk);
  }
  return sk;
}

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_POSTS, JSON.stringify(posts));
}

async function renderBoard() {
  const sk = loadSk();
  const pk = await derivePk(sk, "bboard:poster:v1");
  const skEl = document.getElementById("my-sk");
  const pkEl = document.getElementById("my-pk");
  if (skEl) skEl.textContent = sk;
  if (pkEl) pkEl.textContent = `pk: ${pk}`;

  const posts = loadPosts();
  const list = document.getElementById("post-list");
  const count = document.getElementById("post-count");
  if (count) count.textContent = `(${posts.length})`;
  if (!list) return;

  if (!posts.length) {
    list.innerHTML = `<li class="empty">Board vacant — post the first message (bound to your local pk).</li>`;
    return;
  }

  list.innerHTML = posts
    .map((p) => {
      const mine = p.ownerPk === pk;
      return `<li class="post-item" data-id="${p.id}">
        <div class="meta">
          <span>seq ${p.seq}</span>
          <span>owner ${short(p.ownerPk, 8)}</span>
          <span>${new Date(p.ts).toLocaleString()}</span>
          ${mine ? '<span style="color:var(--ok)">you</span>' : ""}
        </div>
        <p class="body"></p>
        <div class="actions">
          ${mine ? `<button type="button" class="btn danger small" data-take-down="${p.id}">Take down</button>` : `<span class="muted small">Only owner pk can take down</span>`}
        </div>
      </li>`;
    })
    .join("");

  // Set text safely
  [...list.querySelectorAll(".post-item")].forEach((li) => {
    const id = li.getAttribute("data-id");
    const p = posts.find((x) => x.id === id);
    const body = li.querySelector(".body");
    if (body && p) body.textContent = p.body;
  });

  list.querySelectorAll("[data-take-down]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-take-down");
      const myPk = await derivePk(loadSk(), "bboard:poster:v1");
      let next = loadPosts();
      const target = next.find((x) => x.id === id);
      if (!target || target.ownerPk !== myPk) {
        alert("Not your post — take-down requires matching derived pk.");
        return;
      }
      next = next.filter((x) => x.id !== id);
      savePosts(next);
      renderBoard();
    });
  });
}

function initBoard() {
  document.getElementById("btn-rotate-sk")?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_SK, randomHex(32));
    renderBoard();
  });

  document.getElementById("btn-copy-pk")?.addEventListener("click", async () => {
    const pk = await derivePk(loadSk(), "bboard:poster:v1");
    try {
      await navigator.clipboard.writeText(pk);
    } catch {
      /* ignore */
    }
  });

  document.getElementById("btn-post")?.addEventListener("click", async () => {
    const ta = document.getElementById("post-body");
    const body = (ta?.value || "").trim();
    if (!body) return;
    const pk = await derivePk(loadSk(), "bboard:poster:v1");
    const posts = loadPosts();
    posts.unshift({
      id: randomHex(8),
      seq: posts.length + 1,
      body,
      ownerPk: pk,
      ts: Date.now(),
    });
    savePosts(posts);
    if (ta) ta.value = "";
    renderBoard();
  });

  document.getElementById("btn-clear-board")?.addEventListener("click", () => {
    if (confirm("Clear all local posts?")) {
      savePosts([]);
      renderBoard();
    }
  });

  renderBoard();
}

/* ---------- Wallets ---------- */
function initWallets() {
  document.getElementById("btn-scan-wallets")?.addEventListener("click", () => {
    const grid = document.getElementById("wallet-grid");
    const status = document.getElementById("wallet-status");
    if (!grid || !status) return;

    const midnight = typeof window !== "undefined" ? window.midnight : undefined;
    if (!midnight || typeof midnight !== "object") {
      status.textContent = "window.midnight not found — install Lace (or another Midnight wallet) and reload.";
      status.className = "status warn";
      grid.innerHTML = `<div class="empty">No providers. Hardcoding window.midnight.mnLace would also fail here.</div>`;
      return;
    }

    const entries = Object.entries(midnight);
    status.textContent = `Found ${entries.length} injection key(s).`;
    status.className = "status ok";

    grid.innerHTML = entries
      .map(([key, api]) => {
        const name = api && typeof api === "object" && "name" in api ? String(api.name) : "(no name)";
        const rdns = api && typeof api === "object" && "rdns" in api ? String(api.rdns) : "—";
        const ver = api && typeof api === "object" && "apiVersion" in api ? String(api.apiVersion) : "—";
        const connectable = api && typeof api.connect === "function";
        return `<article class="wallet-card">
          <h4>${escapeHtml(name)}</h4>
          <div class="kv">key: ${escapeHtml(key)}</div>
          <div class="kv">rdns: ${escapeHtml(rdns)}</div>
          <div class="kv">apiVersion: ${escapeHtml(ver)}</div>
          <div class="kv">connect: ${connectable ? "yes" : "no"}</div>
        </article>`;
      })
      .join("");
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Donate ---------- */
function initDonate() {
  document.getElementById("copy-addr")?.addEventListener("click", async () => {
    const addr = document.getElementById("donation-addr")?.textContent || "";
    try {
      await navigator.clipboard.writeText(addr);
      const btn = document.getElementById("copy-addr");
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = prev; }, 1200);
      }
    } catch {
      /* ignore */
    }
  });
}

initForge();
initBoard();
initWallets();
initDonate();
