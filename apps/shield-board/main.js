/**
 * Shield Board — dual-state Midnight privacy bulletin studio (browser-local).
 * Built by @kshot9000 / Kshot3000 / Midnight-GrokBot-Agent.
 *
 * Public pane = commitments + owner pk + seq (what a ledger might show).
 * Private pane = message bodies that stay local until disclosed.
 * Auth = witness-derived pk (MPS-0029) — not ownPublicKey() alone.
 *
 * Not on-chain. No Compact compile/deploy. No Lace transfers.
 */
(() => {
  const STORAGE = 'shield-board:dual:v1';
  const DOMAIN = 'shield-board:v1';
  const DONATE =
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v';

  /** @typedef {{
   *   id: string,
   *   commitment: string,
   *   ownerPk: string,
   *   seq: number,
   *   createdAt: number,
   *   disclosed: boolean,
   *   body?: string
   * }} Post */

  /** @type {{ secret: string, seq: number, posts: Post[], log: string[] }} */
  let state;

  const $ = (id) => document.getElementById(id);

  function bytesToHex(bytes) {
    return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    const clean = String(hex || '').replace(/^0x/, '').toLowerCase();
    if (clean.length % 2) return new Uint8Array(0);
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
    return out;
  }

  function randomHex(nBytes = 32) {
    const b = new Uint8Array(nBytes);
    crypto.getRandomValues(b);
    return bytesToHex(b);
  }

  function pad32(ascii) {
    const enc = new TextEncoder().encode(ascii);
    const out = new Uint8Array(32);
    out.set(enc.slice(0, 32));
    return out;
  }

  async function sha256Hex(bytes) {
    const dig = await crypto.subtle.digest('SHA-256', bytes);
    return bytesToHex(new Uint8Array(dig));
  }

  /** Domain-separated pk ≈ persistentHash([pad(domain), sk]) */
  async function derivePk(secretHex) {
    const sk = hexToBytes(secretHex);
    if (sk.length !== 32) {
      // Accept passphrase: hash to 32 bytes first
      const raw = new TextEncoder().encode(secretHex);
      const skHash = new Uint8Array(await crypto.subtle.digest('SHA-256', raw));
      const material = new Uint8Array(64);
      material.set(pad32(DOMAIN + ':pk'), 0);
      material.set(skHash, 32);
      return sha256Hex(material);
    }
    const material = new Uint8Array(64);
    material.set(pad32(DOMAIN + ':pk'), 0);
    material.set(sk, 32);
    return sha256Hex(material);
  }

  async function commitmentOf(body, ownerPk, seq) {
    const enc = new TextEncoder();
    const payload = enc.encode(`${DOMAIN}|${seq}|${ownerPk}|${body}`);
    return sha256Hex(payload);
  }

  function short(hex, n = 8) {
    if (!hex) return '—';
    if (hex.length <= n * 2 + 1) return hex;
    return `${hex.slice(0, n)}…${hex.slice(-4)}`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && typeof p.secret === 'string' && Array.isArray(p.posts)) {
          return {
            secret: p.secret,
            seq: Number(p.seq) || 0,
            posts: p.posts,
            log: Array.isArray(p.log) ? p.log.slice(0, 60) : [],
          };
        }
      }
    } catch { /* fresh */ }
    return {
      secret: randomHex(32),
      seq: 0,
      posts: [],
      log: ['Shield Board ready — dual-state local stub.'],
    };
  }

  function save() {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({
        secret: state.secret,
        seq: state.seq,
        posts: state.posts,
        log: state.log.slice(0, 60),
      }),
    );
  }

  function log(line) {
    const stamp = new Date().toLocaleTimeString();
    state.log.unshift(`[${stamp}] ${line}`);
    if (state.log.length > 60) state.log.length = 60;
    save();
    renderLog();
  }

  function toast(msg) {
    const el = $('toast');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.classList.remove('show');
    }, 2600);
  }

  function renderLog() {
    const el = $('activity-log');
    if (el) el.textContent = state.log.join('\n') || 'Quiet.';
  }

  async function renderIdentity() {
    const input = $('secret-key');
    if (input && input.value !== state.secret && document.activeElement !== input) {
      input.value = state.secret;
    }
    const pk = await derivePk(state.secret);
    const pkEl = $('pk-display');
    if (pkEl) {
      pkEl.textContent = pk;
      pkEl.title = pk;
    }
    return pk;
  }

  function renderStats() {
    const posts = state.posts.length;
    const sealed = state.posts.filter((p) => !p.disclosed).length;
    const disclosed = state.posts.filter((p) => p.disclosed).length;
    const set = (id, v) => {
      const el = $(id);
      if (el) el.textContent = String(v);
    };
    set('stat-posts', posts);
    set('stat-sealed', sealed);
    set('stat-disclosed', disclosed);
    set('stat-seq', state.seq);
  }

  async function myPk() {
    return derivePk(state.secret);
  }

  async function renderLists(myPkHex) {
    const pub = $('public-list');
    const priv = $('private-list');
    const pubEmpty = $('public-empty');
    const privEmpty = $('private-empty');
    if (!pub || !priv) return;

    pub.innerHTML = '';
    priv.innerHTML = '';

    if (state.posts.length === 0) {
      if (pubEmpty) pubEmpty.hidden = false;
      if (privEmpty) privEmpty.hidden = false;
      return;
    }
    if (pubEmpty) pubEmpty.hidden = true;

    const mineBodies = state.posts.filter(
      (p) => p.body != null && p.ownerPk === myPkHex,
    );
    if (privEmpty) privEmpty.hidden = mineBodies.length > 0;

    for (const post of [...state.posts].reverse()) {
      const mine = post.ownerPk === myPkHex;
      const li = document.createElement('li');
      li.className = 'post-card';
      const bodyPublic = post.disclosed
        ? `<div class="body">${escapeHtml(post.body || '(missing body)')}</div>`
        : `<div class="body muted">Body sealed — commitment only</div>`;
      li.innerHTML = `
        <div class="meta">
          <span class="tag ${post.disclosed ? 'open' : 'sealed'}">${post.disclosed ? 'disclosed' : 'sealed'}</span>
          ${mine ? '<span class="tag mine">your pk</span>' : ''}
          <span>#${escapeHtml(post.id.slice(0, 8))}</span>
          <span>seq ${post.seq}</span>
        </div>
        <div class="commitment mono" title="Commitment hash">H = ${escapeHtml(short(post.commitment, 14))}</div>
        <div class="meta">owner ${escapeHtml(short(post.ownerPk, 10))}</div>
        ${bodyPublic}
        <div class="actions"></div>
      `;
      const actions = li.querySelector('.actions');
      if (mine && !post.disclosed && post.body != null) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn disclose small';
        btn.textContent = 'Disclose body';
        btn.addEventListener('click', () => void disclose(post.id));
        actions.appendChild(btn);
      }
      const td = document.createElement('button');
      td.type = 'button';
      if (mine) {
        td.className = 'btn danger small';
        td.textContent = 'Take down';
        td.title = 'Remove as witness-derived owner';
      } else {
        td.className = 'btn danger small';
        td.textContent = 'Forge take-down';
        td.title = 'MPS-0029 demo: wrong secret cannot take down';
      }
      td.addEventListener('click', () => void takeDown(post.id));
      actions.appendChild(td);
      pub.appendChild(li);

      // Private vault: bodies for the current witness only
      if (mine && post.body != null) {
        const pli = document.createElement('li');
        pli.className = 'post-card';
        pli.innerHTML = `
          <div class="meta">
            <span class="tag sealed">local vault</span>
            <span>#${escapeHtml(post.id.slice(0, 8))}</span>
            <span class="tag ${post.disclosed ? 'open' : 'sealed'}">${post.disclosed ? 'also public' : 'not disclosed'}</span>
          </div>
          <div class="body">${escapeHtml(post.body)}</div>
          <div class="commitment mono">H = ${escapeHtml(short(post.commitment, 12))}</div>
        `;
        priv.appendChild(pli);
      }
    }
  }

  async function renderAll() {
    await renderIdentity();
    const pk = await myPk();
    renderStats();
    await renderLists(pk);
    renderLog();
  }

  async function runProveAnimation(label) {
    const rail = $('prove-rail');
    const fill = $('prove-fill');
    const lab = $('prove-label');
    if (!rail || !fill || !lab) return;
    rail.hidden = false;
    lab.textContent = label;
    fill.style.width = '0%';
    fill.style.transition = 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
    await new Promise((r) => requestAnimationFrame(() => r()));
    fill.style.width = '100%';
    await new Promise((r) => setTimeout(r, 950));
    lab.textContent = 'Local commitment ready (not a ZK proof).';
    await new Promise((r) => setTimeout(r, 400));
    rail.hidden = true;
    fill.style.width = '0%';
  }

  async function seal() {
    const ta = $('post-body');
    const body = (ta?.value || '').trim();
    if (!body) {
      toast('Write a private message first.');
      return;
    }
    const discloseNow = Boolean($('auto-disclose')?.checked);
    const ownerPk = await myPk();
    const seq = state.seq;
    const commitment = await commitmentOf(body, ownerPk, seq);
    await runProveAnimation('Hashing commitment · simulating prove…');

    const post = {
      id: randomHex(8),
      commitment,
      ownerPk,
      seq,
      createdAt: Date.now(),
      disclosed: discloseNow,
      body,
    };
    state.posts.push(post);
    state.seq += 1;
    if (ta) ta.value = '';
    const cc = $('char-count');
    if (cc) cc.textContent = '0';
    log(
      `Sealed #${post.id.slice(0, 8)} · seq ${post.seq} · ${discloseNow ? 'disclosed' : 'private body'} · pk ${short(ownerPk)}`,
    );
    toast(discloseNow ? 'Committed & disclosed.' : 'Sealed — body stays in vault.');
    save();
    await renderAll();
  }

  async function disclose(id) {
    const post = state.posts.find((p) => p.id === id);
    if (!post) return;
    const pk = await myPk();
    if (pk !== post.ownerPk) {
      log(`Disclose denied #${id.slice(0, 8)} — not owner.`);
      toast('Only the owner can disclose.');
      return;
    }
    if (post.body == null) {
      toast('No local body to disclose.');
      return;
    }
    post.disclosed = true;
    log(`Disclosed #${id.slice(0, 8)}`);
    toast('Body published to the public pane.');
    save();
    await renderAll();
  }

  async function takeDown(id) {
    const post = state.posts.find((p) => p.id === id);
    if (!post) return;
    const pk = await myPk();
    if (pk !== post.ownerPk) {
      log(`Take-down FORGED attempt blocked #${id.slice(0, 8)} — pk mismatch.`);
      toast('Take-down rejected — witness pk does not match owner.');
      return;
    }
    state.posts = state.posts.filter((p) => p.id !== id);
    log(`Take-down ok #${id.slice(0, 8)} · removed from public + vault`);
    toast('Post taken down.');
    save();
    await renderAll();
  }

  function scanWallets() {
    const grid = $('wallet-grid');
    const status = $('wallet-status');
    if (!grid || !status) return;
    grid.innerHTML = '';
    const midnight = window.midnight;
    if (!midnight) {
      status.textContent = 'window.midnight missing — install Lace / Midnight wallet, then refresh.';
      status.className = 'status warn';
      log('Wallet scan: no window.midnight');
      return;
    }
    const keys = Object.keys(midnight);
    const legacy = Boolean(midnight.mnLace);
    const providers = keys
      .map((key) => ({ key, api: midnight[key] }))
      .filter((p) => p.api && typeof p.api.connect === 'function');

    status.textContent = `${providers.length} provider(s) · keys=${keys.length} · mnLace=${legacy ? 'present' : 'absent'}`;
    status.className = providers.length ? 'status ok' : 'status warn';

    if (providers.length === 0) {
      grid.innerHTML = `<div class="wallet-card"><h4>No connect() providers</h4><p class="kv">Enumerate Object.values(window.midnight) — do not hardcode mnLace.</p></div>`;
    } else {
      for (const p of providers) {
        const name = String(p.api.name || 'Unknown').replace(/[<>]/g, '');
        const rdns = String(p.api.rdns || '(none)');
        const ver = String(p.api.apiVersion || '?');
        const card = document.createElement('div');
        card.className = 'wallet-card';
        card.innerHTML = `<h4>${escapeHtml(name)}</h4>
          <div class="kv">rdns: ${escapeHtml(rdns)}</div>
          <div class="kv">api: ${escapeHtml(ver)}</div>
          <div class="kv">key: ${escapeHtml(p.key.slice(0, 12))}… ${p.key === 'mnLace' ? '(legacy alias)' : ''}</div>`;
        grid.appendChild(card);
      }
    }
    log(`Wallet scan: ${providers.length} provider(s), mnLace=${legacy}`);
  }

  function initStarfield() {
    const canvas = $('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      const count = reduce ? 50 : Math.min(140, Math.floor((innerWidth * innerHeight) / 10000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.3 + 0.25) * dpr,
        a: Math.random() * 0.55 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.12 + 0.02,
      }));
    }

    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? s.a : s.a * (0.7 + 0.3 * Math.sin(t * 0.001 + s.p));
        ctx.beginPath();
        ctx.fillStyle = `rgba(200,215,255,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduce) {
          s.y += s.s;
          if (s.y > h) {
            s.y = 0;
            s.x = Math.random() * w;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
    addEventListener('beforeunload', () => cancelAnimationFrame(raf), { once: true });
  }

  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
  }

  function wireNav() {
    const toggle = $('nav-toggle');
    const nav = $('site-nav');
    const topbar = $('topbar') || document.querySelector('.topbar');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = topbar ? topbar.classList.toggle('nav-open') : nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function wire() {
    $('btn-seal')?.addEventListener('click', () => void seal());
    $('btn-clear-compose')?.addEventListener('click', () => {
      const ta = $('post-body');
      if (ta) ta.value = '';
      const cc = $('char-count');
      if (cc) cc.textContent = '0';
    });
    $('post-body')?.addEventListener('input', (e) => {
      const cc = $('char-count');
      if (cc) cc.textContent = String(e.target.value.length);
    });
    $('btn-regen-secret')?.addEventListener('click', () => {
      state.secret = randomHex(32);
      const input = $('secret-key');
      if (input) input.value = state.secret;
      log('New local secret generated.');
      toast('New witness secret.');
      save();
      void renderAll();
    });
    $('btn-toggle-secret')?.addEventListener('click', () => {
      const input = $('secret-key');
      const btn = $('btn-toggle-secret');
      if (!input || !btn) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
    $('secret-key')?.addEventListener('change', () => {
      const v = $('secret-key').value.trim();
      if (!v) return;
      state.secret = v;
      log('Secret updated from input.');
      save();
      void renderAll();
    });
    $('btn-copy-pk')?.addEventListener('click', async () => {
      const pk = $('pk-display')?.textContent || '';
      try {
        await navigator.clipboard.writeText(pk);
        toast('Derived pk copied.');
      } catch {
        toast('Copy failed.');
      }
    });
    $('btn-clear-log')?.addEventListener('click', () => {
      state.log = ['Log cleared.'];
      save();
      renderLog();
    });
    $('btn-scan-wallets')?.addEventListener('click', () => scanWallets());
    $('copy-addr')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(DONATE);
        toast('ADA address copied.');
      } catch {
        toast('Copy failed — select manually.');
      }
    });
    const addr = $('donation-addr');
    if (addr) addr.textContent = DONATE;
  }

  // Boot
  state = load();
  wire();
  wireNav();
  initStarfield();
  initReveal();
  void renderAll();
})();
