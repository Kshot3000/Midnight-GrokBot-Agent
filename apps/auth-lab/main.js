/**
 * Auth Forge Studio — MPS-0029 educational stub (flagship deepen).
 * Simulates forgeable ownPublicKey auth vs witness-derived binding.
 * Not a Compact runtime. Not on-chain. Not Pages-live claims.
 */
(function () {
  "use strict";

  const STORAGE_SK = "mn-auth-lab-sk-v1";
  const STORAGE_POSTS = "mn-auth-lab-posts-v1";
  const STORAGE_SCORE = "mn-auth-lab-score-v1";
  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";

  /** @type {{ ownerPk: string | null, log: string[], phase: string, forged: boolean }} */
  const unsafe = { ownerPk: null, log: [], phase: "idle", forged: false };

  /** @type {{ ownerDerived: string | null, aliceSk: string | null, held: boolean }} */
  const safe = { ownerDerived: null, aliceSk: null, held: false };

  let watchTimer = 0;

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

  function announce(msg) {
    const el = document.getElementById("live-region");
    if (el) el.textContent = msg;
  }

  function pushLog(line) {
    const stamp = new Date().toLocaleTimeString();
    unsafe.log.unshift(`[${stamp}] ${line}`);
    if (unsafe.log.length > 40) unsafe.log.length = 40;
    const el = document.getElementById("forge-log");
    if (el) el.textContent = unsafe.log.join("\n");
  }

  function setStatus(id, text, kind = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = `status${kind ? ` ${kind}` : ""}`;
  }

  function setRail(id, pct, labelId, label) {
    const meter = document.getElementById(id);
    const fill = meter?.querySelector(".rail-fill");
    const lab = document.getElementById(labelId);
    const clamped = Math.max(0, Math.min(100, pct));
    if (fill) fill.style.width = `${clamped}%`;
    if (meter) meter.setAttribute("aria-valuenow", String(clamped));
    if (lab) lab.textContent = label;
  }

  function setJourney(phase, detail) {
    unsafe.phase = phase;
    const order = ["idle", "deployed", "forged", "safe"];
    const idx = order.indexOf(phase);
    document.querySelectorAll(".journey-step").forEach((step) => {
      const p = step.getAttribute("data-phase");
      const pi = order.indexOf(p || "");
      step.classList.remove("is-active", "is-done", "is-bad");
      step.removeAttribute("aria-current");
      if (p === phase) {
        step.classList.add("is-active");
        if (phase === "forged") step.classList.add("is-bad");
        if (phase === "safe") step.classList.add("is-done");
        step.setAttribute("aria-current", "step");
      } else if (pi >= 0 && pi < idx) {
        step.classList.add("is-done");
        if (p === "forged" && unsafe.forged) step.classList.add("is-bad");
      }
    });
    const live = document.getElementById("journey-live");
    if (live) {
      live.textContent = detail || `Phase: ${phase}`;
      live.className = `journey-live status${
        phase === "forged" ? " fail" : phase === "safe" ? " ok" : phase === "deployed" ? " warn" : ""
      }`;
    }
  }

  function updateRailsFromState() {
    if (unsafe.forged) {
      setRail("rail-unsafe", 100, "rail-unsafe-label", "100% — forge succeeded (theater auth)");
    } else if (unsafe.ownerPk) {
      setRail("rail-unsafe", 55, "rail-unsafe-label", "55% — owner claim stored; forge ready");
    } else {
      setRail("rail-unsafe", 0, "rail-unsafe-label", "0% forge pressure");
    }
    if (safe.held) {
      setRail("rail-safe", 100, "rail-safe-label", "100% integrity — forger rejected");
    } else if (safe.ownerDerived) {
      setRail("rail-safe", 85, "rail-safe-label", "85% — safe owner bound; try Mallory");
    } else {
      setRail("rail-safe", 40, "rail-safe-label", "40% — deploy safe path to lock integrity");
    }
  }

  /* ---------- Starfield ---------- */
  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!(canvas instanceof HTMLCanvasElement)) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    /** @type {{ x: number; y: number; r: number; a: number; s: number }[]} */
    let stars = [];
    let raf = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const count = Math.min(160, Math.floor((window.innerWidth * window.innerHeight) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.3) * devicePixelRatio,
        a: Math.random() * 0.7 + 0.2,
        s: Math.random() * 0.4 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(200, 214, 255, ${st.a})`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduced) {
          st.a += (Math.random() - 0.5) * 0.02;
          st.a = Math.max(0.15, Math.min(0.9, st.a));
          st.y += st.s * 0.15;
          if (st.y > h) st.y = 0;
        }
      }
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      resize();
      draw();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- Nav toggle ---------- */
  function initNav() {
    const btn = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    btn?.addEventListener("click", () => {
      const open = nav?.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav?.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        btn?.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Forge demo ---------- */
  function initForge() {
    const aliceInput = document.getElementById("alice-pk");
    const malloryInput = document.getElementById("mallory-claim");
    if (aliceInput instanceof HTMLInputElement && !aliceInput.value) {
      aliceInput.value = randomHex(32);
    }

    document.getElementById("btn-deploy")?.addEventListener("click", () => {
      const pk = (aliceInput instanceof HTMLInputElement ? aliceInput.value : "").trim().toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(pk)) {
        setStatus("deploy-status", "Need 32-byte hex (64 chars).", "fail");
        announce("Deploy failed: invalid hex length");
        return;
      }
      unsafe.ownerPk = pk;
      unsafe.forged = false;
      setStatus("deploy-status", `Deployed. owner = ${short(pk)}`, "ok");
      pushLog(`UNSAFE deploy: owner ← ${short(pk)} (claimed ownPublicKey)`);
      setJourney("deployed", "Phase: deployed — Mallory can forge by copying Alice’s pk.");
      updateRailsFromState();
      announce("Unsafe contract deployed");
    });

    document.getElementById("btn-copy-alice")?.addEventListener("click", () => {
      if (malloryInput instanceof HTMLInputElement && unsafe.ownerPk) {
        malloryInput.value = unsafe.ownerPk;
        setStatus("forge-status", "Claim field set to Alice’s stored owner pk.", "warn");
        announce("Copied Alice pk into Mallory claim");
      } else {
        setStatus("forge-status", "Deploy first, then copy.", "fail");
      }
    });

    document.getElementById("btn-forge")?.addEventListener("click", () => {
      if (!unsafe.ownerPk) {
        setStatus("forge-status", "Deploy first.", "fail");
        return;
      }
      const claim = (malloryInput instanceof HTMLInputElement ? malloryInput.value : "").trim().toLowerCase();
      if (claim === unsafe.ownerPk) {
        unsafe.forged = true;
        setStatus("forge-status", "PASS — Mallory forged Alice’s ownPublicKey. Admin gate bypassed.", "fail");
        pushLog(`FORGE SUCCESS: assert(ownPublicKey()==owner) held for Mallory claim ${short(claim)}`);
        setJourney("forged", "Phase: forged — theater auth collapsed. Try the safe path below.");
        updateRailsFromState();
        announce("Forge succeeded. Admin gate bypassed.");
      } else {
        setStatus("forge-status", "Reject — claim ≠ owner (Mallory forgot to forge).", "ok");
        pushLog(`Forge failed: claim ${short(claim)} ≠ owner ${short(unsafe.ownerPk)}`);
        announce("Forge rejected — claim did not match owner");
      }
    });

    document.getElementById("btn-safe-deploy")?.addEventListener("click", async () => {
      safe.aliceSk = randomHex(32);
      safe.ownerDerived = await derivePk(safe.aliceSk);
      safe.held = false;
      setStatus("safe-status", `Safe deploy. owner = derive(Alice.sk) → ${short(safe.ownerDerived)}`, "ok");
      pushLog(`SAFE deploy: owner ← derive(sk) ${short(safe.ownerDerived)} (sk stays local)`);
      updateRailsFromState();
      announce("Safe witness-bound contract deployed");
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
        safe.held = true;
        setStatus("safe-status", `REJECT — Mallory derive ${short(malloryDerived)} ≠ owner. Auth holds.`, "ok");
        pushLog(`SAFE reject: Mallory cannot match owner without Alice’s secret`);
        setJourney("safe", "Phase: witness-bound — forger rejected; Alice can still pass.");
        updateRailsFromState();
        announce("Safe path rejected Mallory");
      }
    });

    document.getElementById("btn-safe-alice")?.addEventListener("click", async () => {
      if (!safe.aliceSk || !safe.ownerDerived) {
        setStatus("safe-status", "Safe-deploy first.", "fail");
        return;
      }
      const again = await derivePk(safe.aliceSk);
      if (again === safe.ownerDerived) {
        safe.held = true;
        setStatus("safe-status", `PASS — Alice proves knowledge of sk → ${short(again)}`, "ok");
        pushLog(`SAFE pass: Alice adminOnly() with witness-derived pk`);
        setJourney("safe", "Phase: witness-bound — Alice authenticated via secret knowledge.");
        updateRailsFromState();
        announce("Alice authenticated on safe path");
      }
    });

    document.getElementById("btn-reset-forge")?.addEventListener("click", () => {
      unsafe.ownerPk = null;
      unsafe.forged = false;
      unsafe.log = [];
      safe.ownerDerived = null;
      safe.aliceSk = null;
      safe.held = false;
      if (aliceInput instanceof HTMLInputElement) aliceInput.value = randomHex(32);
      if (malloryInput instanceof HTMLInputElement) malloryInput.value = "";
      setStatus("deploy-status", "Not deployed.");
      setStatus("forge-status", "Waiting…");
      setStatus("safe-status", "Safe contract not deployed.");
      const logEl = document.getElementById("forge-log");
      if (logEl) logEl.textContent = "";
      setJourney("idle", "Phase: idle — deploy the unsafe contract to begin.");
      updateRailsFromState();
      announce("Forge theater reset");
    });

    setJourney("idle", "Phase: idle — deploy the unsafe contract to begin.");
    updateRailsFromState();
  }

  /* ---------- Scorecard ---------- */
  function scoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_SCORE);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveScore(map) {
    localStorage.setItem(STORAGE_SCORE, JSON.stringify(map));
  }

  function renderScore() {
    const map = scoreState();
    let safeN = 0;
    let unsafeN = 0;
    let safeMax = 0;
    let unsafeMax = 0;
    document.querySelectorAll("#score-list input[type=checkbox]").forEach((input) => {
      if (!(input instanceof HTMLInputElement)) return;
      const id = input.getAttribute("data-id") || "";
      const kind = input.getAttribute("data-score");
      input.checked = Boolean(map[id]);
      if (kind === "safe") {
        safeMax += 1;
        if (input.checked) safeN += 1;
      } else if (kind === "unsafe") {
        unsafeMax += 1;
        if (input.checked) unsafeN += 1;
      }
    });

    const totalChecked = safeN + unsafeN;
    let health = totalChecked === 0 ? null : Math.round(((safeN * 25) - (unsafeN * 30) + 40) );
    if (health !== null) health = Math.max(0, Math.min(100, health));

    const num = document.getElementById("score-num");
    const ring = document.getElementById("score-ring");
    const verdict = document.getElementById("score-verdict");
    if (num) num.textContent = health === null ? "—" : String(health);
    if (ring && health !== null) {
      const deg = Math.round((health / 100) * 360);
      const color = health >= 70 ? "var(--ok)" : health >= 40 ? "var(--warn)" : "var(--danger)";
      ring.style.background = `radial-gradient(circle at center, rgba(8,12,24,0.95) 58%, transparent 59%), conic-gradient(${color} ${deg}deg, rgba(124,156,255,0.12) ${deg}deg)`;
    } else if (ring) {
      ring.style.background = "";
    }
    if (verdict) {
      if (health === null) {
        verdict.textContent = "Check items to grade your design.";
        verdict.className = "status";
      } else if (unsafeN > 0 && safeN < 2) {
        verdict.textContent = `At risk — ${unsafeN} forgeable pattern(s) still checked.`;
        verdict.className = "status fail";
      } else if (health >= 70) {
        verdict.textContent = `Solid — ${safeN}/${safeMax} safe practices · ${unsafeN} anti-patterns.`;
        verdict.className = "status ok";
      } else {
        verdict.textContent = `Mixed — raise safe checks, clear anti-patterns.`;
        verdict.className = "status warn";
      }
    }
  }

  function initScorecard() {
    document.querySelectorAll("#score-list input[type=checkbox]").forEach((input) => {
      input.addEventListener("change", () => {
        const map = scoreState();
        if (!(input instanceof HTMLInputElement)) return;
        const id = input.getAttribute("data-id") || "";
        if (input.checked) map[id] = true;
        else delete map[id];
        saveScore(map);
        renderScore();
        announce("Scorecard updated");
      });
    });
    document.getElementById("btn-score-reset")?.addEventListener("click", () => {
      saveScore({});
      renderScore();
      announce("Scorecard cleared");
    });
    renderScore();
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
          ${
            mine
              ? `<button type="button" class="btn danger small" data-take-down="${p.id}">Take down</button>`
              : `<span class="muted small">Only owner pk can take down</span>`
          }
        </div>
      </li>`;
      })
      .join("");

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
          announce("Take-down denied — not your derived pk");
          return;
        }
        next = next.filter((x) => x.id !== id);
        savePosts(next);
        renderBoard();
        announce("Post taken down");
      });
    });
  }

  function initBoard() {
    const ta = document.getElementById("post-body");
    const counter = document.getElementById("char-count");
    const syncCount = () => {
      if (ta instanceof HTMLTextAreaElement && counter) {
        counter.textContent = `${ta.value.length} / 280`;
      }
    };
    ta?.addEventListener("input", syncCount);
    syncCount();

    document.getElementById("btn-rotate-sk")?.addEventListener("click", () => {
      localStorage.setItem(STORAGE_SK, randomHex(32));
      renderBoard();
      announce("Local secret rotated");
    });

    document.getElementById("btn-copy-pk")?.addEventListener("click", async () => {
      const pk = await derivePk(loadSk(), "bboard:poster:v1");
      try {
        await navigator.clipboard.writeText(pk);
        announce("Public key copied");
      } catch {
        announce("Copy failed");
      }
    });

    document.getElementById("btn-post")?.addEventListener("click", async () => {
      const body = (ta instanceof HTMLTextAreaElement ? ta.value : "").trim();
      if (!body) {
        announce("Post body empty");
        return;
      }
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
      if (ta instanceof HTMLTextAreaElement) ta.value = "";
      syncCount();
      renderBoard();
      announce("Post published to local board");
    });

    document.getElementById("btn-clear-board")?.addEventListener("click", () => {
      if (confirm("Clear all local posts?")) {
        savePosts([]);
        renderBoard();
        announce("Board cleared");
      }
    });

    renderBoard();
  }

  /* ---------- Wallets ---------- */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function scanWallets(silent = false) {
    const grid = document.getElementById("wallet-grid");
    const status = document.getElementById("wallet-status");
    if (!grid || !status) return;

    const midnight = typeof window !== "undefined" ? window.midnight : undefined;
    if (!midnight || typeof midnight !== "object") {
      status.textContent = silent
        ? "Watching… window.midnight not found."
        : "window.midnight not found — install Lace (or another Midnight wallet) and reload.";
      status.className = "status warn";
      if (!silent) {
        grid.innerHTML = `<div class="empty">No providers. Hardcoding window.midnight.mnLace would also fail here. Read-only scan — no connect.</div>`;
      }
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
          <div class="kv">connect: ${connectable ? "yes (not called)" : "no"}</div>
        </article>`;
      })
      .join("");
  }

  function initWallets() {
    document.getElementById("btn-scan-wallets")?.addEventListener("click", () => {
      scanWallets(false);
      announce("Wallet scan complete");
    });

    document.getElementById("chk-watch")?.addEventListener("change", (e) => {
      const on = e.target instanceof HTMLInputElement && e.target.checked;
      if (watchTimer) {
        clearInterval(watchTimer);
        watchTimer = 0;
      }
      if (on) {
        scanWallets(true);
        watchTimer = window.setInterval(() => scanWallets(true), 2000);
        announce("Injection watch on");
      } else {
        announce("Injection watch off");
      }
    });
  }

  /* ---------- Donate ---------- */
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
      announce("Copy failed");
    }
  }

  function initDonate() {
    document.getElementById("copy-addr")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget instanceof HTMLElement ? e.currentTarget : null);
    });
    document.getElementById("dock-copy-addr")?.addEventListener("click", (e) => {
      copyDonate(e.currentTarget instanceof HTMLElement ? e.currentTarget : null);
    });
  }

  /* ---------- Boot ---------- */
  initStarfield();
  initReveal();
  initNav();
  initForge();
  initScorecard();
  initBoard();
  initWallets();
  initDonate();
})();
