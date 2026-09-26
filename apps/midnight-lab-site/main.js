(function () {
  "use strict";

  const DONATE_ADDR =
    "addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v";

  /** @type {{ key: string, val: string, cat: string, note: string }[]} */
  const COMPAT_PINS = [
    {
      key: "Compact toolchain",
      val: "0.31.1",
      cat: "toolchain",
      note: "Lab research pin for the Compact compiler / CLI. Confirm against the official Midnight installation matrix before any deploy.",
    },
    {
      key: "Compact language",
      val: "~0.23",
      cat: "toolchain",
      note: "Language pragma band used in this repo’s Compact skeletons. Prefer the version required by your toolchain release notes.",
    },
    {
      key: "Runtime",
      val: "0.16.0",
      cat: "runtime",
      note: "Midnight runtime pin from Sep 2026 research notes. Pair with matching proof-server and midnight-js.",
    },
    {
      key: "midnight-js",
      val: "4.1.1",
      cat: "runtime",
      note: "JS client libraries research pin. Check peer dependency ranges in official packages.",
    },
    {
      key: "wallet-sdk",
      val: "1.2.0",
      cat: "wallet",
      note: "Wallet SDK research pin for browser wallet integration patterns. Not a Lace API claim.",
    },
    {
      key: "DApp Connector",
      val: "4.0.1",
      cat: "wallet",
      note: "DApp Connector API pin used by Lace Connect Studio + lace-midnight-kit 0.3.1. Discovery + connect only in this lab.",
    },
    {
      key: "proof-server",
      val: "8.1.0",
      cat: "runtime",
      note: "Local proof-server research pin. Studios here do not start a proof server — install via official docs.",
    },
  ];

  function announce(msg) {
    const el = document.getElementById("live-region");
    if (el) el.textContent = msg;
  }

  function setDonateStatus(msg, ok) {
    const el = document.getElementById("donate-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-fail", ok === false);
  }

  async function copyDonate(btnId) {
    try {
      await navigator.clipboard.writeText(DONATE_ADDR);
      announce("Donation address copied");
      setDonateStatus("Address copied.", true);
      const btn = document.getElementById(btnId);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = btnId === "dock-copy-addr" ? "Copied!" : "Copied";
        setTimeout(() => {
          btn.textContent = prev;
        }, 1600);
      }
    } catch {
      setDonateStatus("Copy failed — select the address manually.", false);
      announce("Copy failed");
    }
  }

  function initNav() {
    const header = document.getElementById("site-header");
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!header || !toggle || !nav) return;
    const closeNav = () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      toggle.textContent = "☰";
    };
    const openNav = () => {
      header.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      toggle.textContent = "✕";
    };
    toggle.addEventListener("click", () => {
      if (header.classList.contains("nav-open")) closeNav();
      else openNav();
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  function initReveal() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll(".reveal");
    if (!reduceMotion && reveals.length && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("in"));
    }
  }

  function initStarfield() {
    const canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById("starfield"));
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /** @type {{ x: number, y: number, r: number, a: number, s: number }[]} */
    let stars = [];
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor((window.innerWidth * window.innerHeight) / 8500);
      stars = Array.from({ length: Math.max(48, Math.min(count, 180)) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.25,
        a: Math.random() * 0.65 + 0.18,
        s: Math.random() * 0.28 + 0.04,
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

  function initFilters() {
    const chips = document.querySelectorAll(".filter-bar [data-filter]");
    const cards = document.querySelectorAll("#studios-grid .app-card");
    const grid = document.getElementById("studios-grid");
    let emptyEl = document.getElementById("studios-empty");
    if (grid && !emptyEl) {
      emptyEl = document.createElement("div");
      emptyEl.id = "studios-empty";
      emptyEl.className = "studios-empty";
      emptyEl.hidden = true;
      emptyEl.setAttribute("role", "status");
      emptyEl.innerHTML =
        '<p><strong>No studios match this filter.</strong></p>' +
        '<p class="muted small">Try <em>All</em> or clear the chip — cards are LOCAL-TRUE or CONNECT ONLY, not on-chain.</p>' +
        '<button type="button" class="btn ghost small" id="btn-clear-filter">Show all studios</button>';
      grid.after(emptyEl);
      emptyEl.querySelector("#btn-clear-filter")?.addEventListener("click", () => {
        const all = document.querySelector('.filter-bar [data-filter="all"]');
        all?.dispatchEvent(new Event("click"));
      });
    }
    function syncEmpty() {
      if (!emptyEl) return;
      const visible = [...cards].filter((c) => !c.classList.contains("is-hidden"));
      emptyEl.hidden = visible.length > 0;
    }
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.getAttribute("data-filter") || "all";
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        cards.forEach((card) => {
          const tags = (card.getAttribute("data-tags") || "").split(/\s+/);
          const show = filter === "all" || tags.includes(filter);
          card.classList.toggle("is-hidden", !show);
        });
        syncEmpty();
        announce(filter === "all" ? "Showing all studios" : `Filtered to ${filter}`);
      });
    });
    syncEmpty();
  }

  /**
   * Probe sibling studio paths on this origin (parallel).
   * file:// and hub-only local serves correctly report Not found — honest, not a bug.
   * Tries HEAD then falls back to GET; aborts after 3.5s per path.
   */
  let probeGeneration = 0;
  async function probeOne(path, signal) {
    const url = new URL(path, location.href).href;
    const opts = { cache: "no-store", signal, headers: { Accept: "text/html" } };
    try {
      const head = await fetch(url, { ...opts, method: "HEAD" });
      // Some static servers 405 HEAD — treat as inconclusive and try GET
      if (head.ok) return { ok: true, status: head.status, mode: "HEAD" };
      if (head.status !== 405 && head.status !== 501) {
        return { ok: false, status: head.status, mode: "HEAD" };
      }
    } catch {
      /* fall through to GET */
    }
    const res = await fetch(url, { ...opts, method: "GET" });
    return { ok: res.ok, status: res.status, mode: "GET" };
  }

  async function probeStatuses() {
    const gen = ++probeGeneration;
    const cards = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll("#studios-grid .app-card"));
    const total = cards.length;
    const isFile = location.protocol === "file:";
    const btn = document.getElementById("btn-probe-status");
    if (btn) {
      btn.setAttribute("aria-busy", "true");
      btn.classList.add("is-probing");
    }
    const banner = document.getElementById("probe-banner");
    if (banner) {
      banner.hidden = false;
      banner.textContent = isFile
        ? "Probes need http:// — file:// cannot reach sibling studio paths. Honest miss, not a bug."
        : "Probing sibling paths on this origin… Hub-only serves will show Not found — that is expected.";
      banner.className = "probe-banner is-checking";
    }

    /** @type {{ pill: Element, path: string, id: string }[]} */
    const jobs = [];
    for (const card of cards) {
      const id = card.getAttribute("data-id") || "";
      const path = card.getAttribute("data-path") || "";
      const pill = card.querySelector(`[data-status-for="${id}"]`);
      if (!pill) continue;
      pill.textContent = "Checking…";
      pill.className = "status-pill is-checking";
      pill.setAttribute("aria-busy", "true");
      jobs.push({ pill, path, id });
    }

    let reachable = 0;
    if (isFile) {
      for (const { pill, path } of jobs) {
        pill.textContent = "Local file";
        pill.className = "status-pill is-miss";
        pill.removeAttribute("aria-busy");
        pill.title = "Open via http.server (assembled site) to probe sibling paths";
      }
    } else {
      await Promise.all(
        jobs.map(async ({ pill, path }) => {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 3500);
          try {
            const result = await probeOne(path, ctrl.signal);
            if (gen !== probeGeneration) return;
            if (result.ok) {
              pill.textContent = "Reachable";
              pill.className = "status-pill is-ok";
              pill.title = `HTTP ${result.status} (${result.mode}) at ${path}`;
              reachable += 1;
            } else {
              pill.textContent = `HTTP ${result.status}`;
              pill.className = "status-pill is-miss";
              pill.title = `Not found at ${path} on this origin — serve assembled Pages artifact or sibling folders`;
            }
          } catch {
            if (gen !== probeGeneration) return;
            pill.textContent = "Not found";
            pill.className = "status-pill is-miss";
            pill.title = `Could not reach ${path} — honest when only midnight-lab-site is served locally`;
          } finally {
            clearTimeout(timer);
            pill.removeAttribute("aria-busy");
          }
        })
      );
    }

    if (gen !== probeGeneration) return;

    const stat = document.getElementById("stat-reachable");
    if (stat) {
      if (isFile) stat.textContent = "n/a";
      else stat.textContent = `${reachable}/${total}`;
    }
    if (banner) {
      if (isFile) {
        banner.textContent = "file:// mode — probes skipped. Serve with python3 -m http.server to check siblings.";
        banner.className = "probe-banner is-miss";
      } else if (reachable === 0) {
        banner.textContent = `0/${total} reachable on this origin — expected when only the Hub is served. Assembled Pages or a multi-app root would show Reachable. LOCAL-TRUE / CONNECT ONLY honesty.`;
        banner.className = "probe-banner is-miss";
      } else if (reachable < total) {
        banner.textContent = `${reachable}/${total} reachable — partial suite on this origin. Missing paths are honest misses, not fake Pages claims.`;
        banner.className = "probe-banner is-partial";
      } else {
        banner.textContent = `All ${total} studios reachable on this origin. Still LOCAL-TRUE / CONNECT ONLY — not on-chain.`;
        banner.className = "probe-banner is-ok";
      }
    }
    if (btn) {
      btn.removeAttribute("aria-busy");
      btn.classList.remove("is-probing");
    }
    announce(
      isFile
        ? "Status: open via local HTTP server to probe sibling studios"
        : `Status probe: ${reachable} of ${total} reachable on this origin`
    );
  }

  function initCompatExplorer() {
    const grid = document.getElementById("compat-grid");
    const detail = document.getElementById("compat-detail");
    const search = /** @type {HTMLInputElement | null} */ (document.getElementById("compat-search"));
    const chips = document.querySelectorAll("[data-compat-filter]");
    if (!grid || !detail) return;

    let activeCat = "all";
    let query = "";
    /** @type {string | null} */
    let selectedKey = null;

    function renderDetail(pin) {
      if (!pin) {
        detail.innerHTML =
          '<p class="muted">Select a pin to see notes. These are <strong>research pins</strong>, not a substitute for docs.midnight.network.</p>';
        return;
      }
      detail.innerHTML = `
        <h3>${escapeHtml(pin.key)} · <code>${escapeHtml(pin.val)}</code></h3>
        <p>${escapeHtml(pin.note)}</p>
        <p class="muted" style="margin-top:0.55rem">
          Verify:
          <a href="https://docs.midnight.network/getting-started/installation" rel="noopener noreferrer">official installation / matrix</a>
        </p>`;
    }

    function apply() {
      const q = query.trim().toLowerCase();
      grid.querySelectorAll(".compat-item").forEach((btn) => {
        const key = (btn.getAttribute("data-key") || "").toLowerCase();
        const cat = btn.getAttribute("data-cat") || "";
        const val = (btn.getAttribute("data-val") || "").toLowerCase();
        const catOk = activeCat === "all" || cat === activeCat;
        const qOk = !q || key.includes(q) || val.includes(q) || cat.includes(q);
        btn.classList.toggle("is-hidden", !(catOk && qOk));
      });
    }

    COMPAT_PINS.forEach((pin) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "compat-item";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("data-key", pin.key);
      btn.setAttribute("data-cat", pin.cat);
      btn.setAttribute("data-val", pin.val);
      btn.innerHTML = `
        <span class="compat-key">${escapeHtml(pin.key)}</span>
        <span class="compat-val">${escapeHtml(pin.val)}</span>
        <span class="compat-cat">${escapeHtml(pin.cat)}</span>`;
      btn.addEventListener("click", () => {
        selectedKey = pin.key;
        grid.querySelectorAll(".compat-item").forEach((el) => {
          el.classList.toggle("is-selected", el.getAttribute("data-key") === pin.key);
        });
        renderDetail(pin);
        announce(`Selected ${pin.key} ${pin.val}`);
      });
      grid.appendChild(btn);
    });

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeCat = chip.getAttribute("data-compat-filter") || "all";
        chips.forEach((c) => {
          const on = c === chip;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        apply();
        announce(activeCat === "all" ? "Showing all compat pins" : `Compat category: ${activeCat}`);
      });
    });

    search?.addEventListener("input", () => {
      query = search.value || "";
      apply();
    });

    renderDetail(null);
    apply();

    // Restore selection helper for keyboard users after filter
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && selectedKey) {
        selectedKey = null;
        grid.querySelectorAll(".compat-item").forEach((el) => el.classList.remove("is-selected"));
        renderDetail(null);
      }
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }


  const PALETTE_STUDIOS = [
    { name: "Nocturne Messenger", path: "nocturne/", tags: "messenger sealed dm" },
    { name: "Compact Atelier", path: "atelier/", tags: "compact editor lint" },
    { name: "Veil Passport", path: "passport/", tags: "credentials disclose" },
    { name: "Private Ballot", path: "ballot/", tags: "vote poll nullifier" },
    { name: "Proof Playground", path: "proof/", tags: "zk circuit" },
    { name: "Sealed Invite", path: "invite/", tags: "rsvp" },
    { name: "Night Market", path: "market/", tags: "bids listings" },
    { name: "Veil Pledge", path: "pledge/", tags: "tip jar" },
    { name: "Shield Board", path: "board/", tags: "bulletin dual-state" },
    { name: "Auth Forge", path: "auth/", tags: "mps-0029" },
    { name: "Lace Connect", path: "lace/", tags: "wallet connect" },
    { name: "Agent Escrow", path: "escrow/", tags: "role theater" },
    { name: "Donate ADA", path: "#donate", tags: "tip support" },
    { name: "Compat Explorer", path: "#compat", tags: "pins matrix" },
    { name: "Preprod status", path: "#preprod", tags: "compact proof-server local-prove tdust deploy" },
    { name: "Local prove ready", path: "#preprod", tags: "zk prove hello escrow proof-server" },
  ];

  function initCommandPalette() {
    const overlay = document.getElementById("cmd-palette");
    const input = /** @type {HTMLInputElement | null} */ (document.getElementById("cmd-input"));
    const list = document.getElementById("cmd-list");
    const openBtn = document.getElementById("btn-open-palette");
    if (!overlay || !input || !list) return;

    let active = 0;
    let filtered = PALETTE_STUDIOS.slice();

    function close() { closePalette(); }

    function open() {
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden", "false");
      input.value = "";
      active = 0;
      render("");
      requestAnimationFrame(() => input.focus());
      announce("Command palette open — type to filter studios");
    }
    function closePalette() {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden", "true");
      input.removeAttribute("aria-activedescendant");
      announce("Command palette closed");
    }

    function render(q) {
      const qq = (q || "").trim().toLowerCase();
      filtered = PALETTE_STUDIOS.filter((s) => {
        if (!qq) return true;
        return (
          s.name.toLowerCase().includes(qq) ||
          s.path.toLowerCase().includes(qq) ||
          s.tags.toLowerCase().includes(qq)
        );
      });
      if (active >= filtered.length) active = Math.max(0, filtered.length - 1);
      list.innerHTML = "";
      if (!filtered.length) {
        list.innerHTML =
          '<li class="cmd-empty" role="presentation">' +
          '<strong>No matches</strong>' +
          '<span class="muted small">Try “nocturne”, “lace”, “ballot”, or “donate”. Esc closes · LOCAL-TRUE / CONNECT ONLY links.</span>' +
          '</li>';
        return;
      }
      filtered.forEach((s, i) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cmd-item" + (i === active ? " is-active" : "");
        btn.setAttribute("role", "option");
        btn.setAttribute("aria-selected", i === active ? "true" : "false");
        btn.id = `cmd-opt-${i}`;
        btn.innerHTML = `<span><strong>${escapeHtml(s.name)}</strong><span>${escapeHtml(s.path)}</span></span><span class="cmd-go">↵</span>`;
        btn.addEventListener("click", () => go(s));
        li.appendChild(btn);
        list.appendChild(li);
      });
      const activeBtn = list.querySelector(".cmd-item.is-active");
      activeBtn?.scrollIntoView({ block: "nearest" });
      input.setAttribute("aria-activedescendant", activeBtn?.id || "");
    }

    function go(s) {
      close();
      if (s.path.startsWith("#")) {
        const el = document.querySelector(s.path);
        el?.scrollIntoView({ behavior: "smooth" });
        announce(`Jumped to ${s.name}`);
      } else {
        location.href = s.path;
      }
    }

    openBtn?.addEventListener("click", open);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    input.addEventListener("input", () => {
      active = 0;
      render(input.value);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        active = Math.min(filtered.length - 1, active + 1);
        render(input.value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        active = Math.max(0, active - 1);
        render(input.value);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[active]) go(filtered[active]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener("keydown", (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (overlay.hidden) open();
        else close();
        return;
      }
      if (e.key === "Escape" && !overlay.hidden) {
        close();
      }
    });
  }



  /**
   * Optional browser probe of local proof-server.
   * Honest: may fail on Pages / CORS / non-local hosts — that is not a deploy claim.
   */
  async function probeProofServerOptional() {
    const pill = document.getElementById("preprod-proof-pill");
    const detail = document.getElementById("preprod-proof-detail");
    if (!pill || !detail) return;
    pill.className = "status-pill is-checking";
    pill.textContent = "Checking…";
    detail.textContent = "Fetching http://127.0.0.1:6300/health …";
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    try {
      const res = await fetch("http://127.0.0.1:6300/health", {
        signal: ctrl.signal,
        mode: "cors",
        cache: "no-store",
      });
      clearTimeout(timer);
      if (res.ok) {
        let body = "";
        try { body = (await res.text()).slice(0, 120); } catch { /* ignore */ }
        pill.className = "status-pill is-ok";
        pill.textContent = "Healthy";
        detail.textContent = body ? `OK · ${body}` : "OK · HTTP " + res.status;
        announce("Proof-server health OK on localhost:6300");
      } else {
        pill.className = "status-pill is-miss";
        pill.textContent = "HTTP " + res.status;
        detail.textContent = "Reached :6300 but non-OK status — check proof-server logs.";
        announce("Proof-server returned HTTP " + res.status);
      }
    } catch (err) {
      clearTimeout(timer);
      pill.className = "status-pill is-miss";
      pill.textContent = "Unreachable";
      const reason = err && err.name === "AbortError" ? "timeout" : (err && err.message) || "blocked";
      detail.textContent =
        "Optional check failed (" + reason + "). Expected on GitHub Pages / CORS. On the build box: curl -sS http://127.0.0.1:6300/health or npm run proof-server:podman";
      announce("Proof-server optional probe failed — not a deploy claim");
    }
  }

  function initPreprodPanel() {
    const compactPill = document.getElementById("preprod-compact-pill");
    if (compactPill) {
      compactPill.className = "status-pill is-ok";
      compactPill.textContent = "Compiled";
      compactPill.title = "hello + agent-escrow Compact artifacts — not on-chain";
      if (compactPill.textContent === "Compiled") compactPill.textContent = "hello + escrow";
    }
    const provePill = document.getElementById("preprod-prove-pill");
    if (provePill) {
      provePill.className = "status-pill is-ok";
      provePill.textContent = "hello + escrow";
      provePill.title = "prove:hello-local + prove:escrow-local (multi-circuit) vs :6300 — NOT on-chain";
    }
    const deployPill = document.getElementById("preprod-deploy-pill");
    if (deployPill) {
      deployPill.className = "status-pill is-miss";
      deployPill.textContent = "Blocked · tDUST";
      deployPill.title = "Faucet captcha / tDUST pending — no on-chain deploy claimed";
    }
    document.getElementById("btn-probe-proof")?.addEventListener("click", () => {
      probeProofServerOptional().catch(() => {});
    });
  }

  function bind() {
    document.getElementById("copy-addr")?.addEventListener("click", () => copyDonate("copy-addr"));
    document.getElementById("dock-copy-addr")?.addEventListener("click", () => copyDonate("dock-copy-addr"));
    document.getElementById("btn-probe-status")?.addEventListener("click", () => {
      probeStatuses().catch(() => announce("Status probe failed"));
    });
  }


  function boot() {
    initNav();
    initReveal();
    initStarfield();
    initFilters();
    initCompatExplorer();
    initCommandPalette();
    initPreprodPanel();
    bind();
    // Auto-probe once after paint — honest results either way
    requestAnimationFrame(() => {
      probeStatuses().catch(() => {});
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
