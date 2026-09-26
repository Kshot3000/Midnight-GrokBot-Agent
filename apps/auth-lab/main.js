/**
 * Auth Forge Studio — LOCAL-TRUE persistence (MPS-0029 educational).
 * Real localStorage, multi-tab sync, export/import.
 * Not a Compact runtime. Not on-chain. Not Pages-live claims.
 */
import {
  DONATE_ADDR,
  DOMAIN_BOARD,
  DOMAIN_PK,
  JOURNEY_PHASES,
  short,
  escapeHtml,
  isHex64,
  normalizeHex64,
  derivePk,
  forgeCanBypass,
  computeScoreHealth,
  emptyForgeState,
} from './auth-core.mjs';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
  createTabSync,
} from './persist.mjs';

/** @type {{ ownerPk: string | null, log: string[], phase: string, forged: boolean, aliceClaim: string | null, malloryClaim: string }} */
let unsafe = { ownerPk: null, log: [], phase: 'idle', forged: false, aliceClaim: null, malloryClaim: '' };

/** @type {{ ownerDerived: string | null, aliceSk: string | null, held: boolean }} */
let safe = { ownerDerived: null, aliceSk: null, held: false };

/** @type {string | null} */
let boardSk = null;
/** @type {Array<{id:string,seq:number,body:string,ownerPk:string,ts:number}>} */
let posts = [];
/** @type {Record<string, boolean>} */
let scoreMap = {};

let watchTimer = 0;
let tabSync = null;
let applyingRemote = false;

function randomHex(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function announce(msg) {
  const el = document.getElementById('live-region');
  if (el) el.textContent = msg;
}

function setBoardError(msg) {
  const el = document.getElementById('board-error');
  if (!el) return;
  if (!msg) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  el.hidden = false;
  el.textContent = msg;
}

function pushLog(line) {
  const stamp = new Date().toLocaleTimeString();
  unsafe.log.unshift(`[${stamp}] ${line}`);
  if (unsafe.log.length > 40) unsafe.log.length = 40;
  const el = document.getElementById('forge-log');
  if (el) el.textContent = unsafe.log.join('\n');
}

function setStatus(id, text, kind = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `status${kind ? ` ${kind}` : ''}`;
}

function setRail(id, pct, labelId, label) {
  const meter = document.getElementById(id);
  const fill = meter?.querySelector('.rail-fill');
  const lab = document.getElementById(labelId);
  const clamped = Math.max(0, Math.min(100, pct));
  if (fill) fill.style.width = `${clamped}%`;
  if (meter) meter.setAttribute('aria-valuenow', String(clamped));
  if (lab) lab.textContent = label;
}

function setJourney(phase, detail) {
  unsafe.phase = phase;
  const order = JOURNEY_PHASES;
  const idx = order.indexOf(phase);
  document.querySelectorAll('.journey-step').forEach((step) => {
    const p = step.getAttribute('data-phase');
    const pi = order.indexOf(p || '');
    step.classList.remove('is-active', 'is-done', 'is-bad');
    step.removeAttribute('aria-current');
    if (p === phase) {
      step.classList.add('is-active');
      if (phase === 'forged') step.classList.add('is-bad');
      if (phase === 'safe') step.classList.add('is-done');
      step.setAttribute('aria-current', 'step');
    } else if (pi >= 0 && pi < idx) {
      step.classList.add('is-done');
      if (p === 'forged' && unsafe.forged) step.classList.add('is-bad');
    }
  });
  const live = document.getElementById('journey-live');
  if (live) {
    live.textContent = detail || `Phase: ${phase}`;
    live.className = `journey-live status${
      phase === 'forged' ? ' fail' : phase === 'safe' ? ' ok' : phase === 'deployed' ? ' warn' : ''
    }`;
  }
}

function updateRailsFromState() {
  if (unsafe.forged) {
    setRail('rail-unsafe', 100, 'rail-unsafe-label', '100% — forge succeeded (theater auth)');
  } else if (unsafe.ownerPk) {
    setRail('rail-unsafe', 55, 'rail-unsafe-label', '55% — owner claim stored; forge ready');
  } else {
    setRail('rail-unsafe', 0, 'rail-unsafe-label', '0% forge pressure');
  }
  if (safe.held) {
    setRail('rail-safe', 100, 'rail-safe-label', '100% integrity — forger rejected');
  } else if (safe.ownerDerived) {
    setRail('rail-safe', 85, 'rail-safe-label', '85% — safe owner bound; try Mallory');
  } else {
    setRail('rail-safe', 40, 'rail-safe-label', '40% — deploy safe path to lock integrity');
  }
}

function snapshotState() {
  const aliceInput = document.getElementById('alice-pk');
  const malloryInput = document.getElementById('mallory-claim');
  return {
    sk: boardSk,
    posts,
    score: { ...scoreMap },
    forge: {
      phase: unsafe.phase,
      ownerPk: unsafe.ownerPk,
      forged: unsafe.forged,
      log: [...unsafe.log],
      aliceClaim:
        aliceInput instanceof HTMLInputElement
          ? normalizeHex64(aliceInput.value) || unsafe.aliceClaim
          : unsafe.aliceClaim,
      malloryClaim:
        malloryInput instanceof HTMLInputElement ? malloryInput.value : unsafe.malloryClaim,
      safe: { ...safe },
    },
  };
}

function applyStudio(data, { announceRemote = false } = {}) {
  const state = data || {};
  boardSk = normalizeHex64(state.sk);
  posts = Array.isArray(state.posts) ? state.posts : [];
  scoreMap = state.score && typeof state.score === 'object' ? { ...state.score } : {};
  const forge = state.forge || emptyForgeState();
  unsafe = {
    ownerPk: forge.ownerPk || null,
    log: Array.isArray(forge.log) ? [...forge.log] : [],
    phase: forge.phase || 'idle',
    forged: Boolean(forge.forged),
    aliceClaim: forge.aliceClaim || forge.ownerPk || null,
    malloryClaim: forge.malloryClaim || '',
  };
  safe = {
    ownerDerived: forge.safe?.ownerDerived || null,
    aliceSk: forge.safe?.aliceSk || null,
    held: Boolean(forge.safe?.held),
  };

  const aliceInput = document.getElementById('alice-pk');
  const malloryInput = document.getElementById('mallory-claim');
  if (aliceInput instanceof HTMLInputElement) {
    aliceInput.value = unsafe.aliceClaim || unsafe.ownerPk || aliceInput.value || randomHex(32);
  }
  if (malloryInput instanceof HTMLInputElement) {
    malloryInput.value = unsafe.malloryClaim || '';
  }

  const logEl = document.getElementById('forge-log');
  if (logEl) logEl.textContent = unsafe.log.join('\n');

  if (unsafe.ownerPk) {
    setStatus('deploy-status', `Deployed. owner = ${short(unsafe.ownerPk)}`, 'ok');
  } else {
    setStatus('deploy-status', 'Not deployed.');
  }
  if (unsafe.forged) {
    setStatus('forge-status', 'PASS — Mallory forged Alice’s ownPublicKey. Admin gate bypassed.', 'fail');
  } else if (unsafe.ownerPk) {
    setStatus('forge-status', 'Waiting…');
  } else {
    setStatus('forge-status', 'Waiting…');
  }
  if (safe.held && safe.ownerDerived) {
    setStatus('safe-status', `Safe path active · owner ${short(safe.ownerDerived)}`, 'ok');
  } else if (safe.ownerDerived) {
    setStatus('safe-status', `Safe deploy. owner = derive(Alice.sk) → ${short(safe.ownerDerived)}`, 'ok');
  } else {
    setStatus('safe-status', 'Safe contract not deployed.');
  }

  const phaseDetail =
    unsafe.phase === 'forged'
      ? 'Phase: forged — theater auth collapsed. Try the safe path below.'
      : unsafe.phase === 'safe'
        ? 'Phase: witness-bound — forger rejected; Alice can still pass.'
        : unsafe.phase === 'deployed'
          ? 'Phase: deployed — Mallory can forge by copying Alice’s pk.'
          : 'Phase: idle — deploy the unsafe contract to begin.';
  setJourney(unsafe.phase || 'idle', phaseDetail);
  updateRailsFromState();
  renderScore();
  renderBoard().catch(console.error);

  if (announceRemote) {
    announce('Synced from another tab');
  }
}

function save() {
  if (applyingRemote) return;
  const saved = saveStudioState(snapshotState());
  try {
    tabSync?.broadcast(saved);
  } catch (_) {
    /* ignore */
  }
}

function load() {
  applyStudio(loadStudioState());
  if (!boardSk) {
    boardSk = randomHex(32);
    save();
  }
}

function startTabSync() {
  tabSync?.stop();
  tabSync = createTabSync({
    onRemote(state) {
      applyingRemote = true;
      try {
        applyStudio(state, { announceRemote: true });
      } finally {
        applyingRemote = false;
      }
    },
  });
}

function exportStudio() {
  const json = exportStudioJSON(snapshotState());
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.href = URL.createObjectURL(blob);
  a.download = `auth-forge-export-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  announce('Studio exported as JSON');
}

async function importStudioFromFile(file) {
  if (!file) return;
  const text = await file.text();
  const result = importStudioJSON(text);
  if (!result.ok) {
    announce(result.error || 'Import failed');
    setBoardError(result.error || 'Import failed');
    return;
  }
  applyStudio(result.state);
  save();
  setBoardError('');
  announce('Auth Forge studio imported');
}

function resetStudio() {
  if (!confirm('Reset Auth Forge studio? Clears scorecard, board, forge, and local secret.')) return;
  clearStudioState();
  boardSk = randomHex(32);
  posts = [];
  scoreMap = {};
  unsafe = { ownerPk: null, log: [], phase: 'idle', forged: false, aliceClaim: null, malloryClaim: '' };
  safe = { ownerDerived: null, aliceSk: null, held: false };
  const aliceInput = document.getElementById('alice-pk');
  const malloryInput = document.getElementById('mallory-claim');
  if (aliceInput instanceof HTMLInputElement) aliceInput.value = randomHex(32);
  if (malloryInput instanceof HTMLInputElement) malloryInput.value = '';
  applyStudio(snapshotState());
  save();
  announce('Studio reset');
}

/* ---------- Starfield ---------- */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  });
}

function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    nodes.forEach((n) => n.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  nodes.forEach((n) => io.observe(n));
}

function initNav() {
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  btn?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      btn?.setAttribute('aria-expanded', 'false');
    });
  });
}

function initForge() {
  const aliceInput = document.getElementById('alice-pk');
  const malloryInput = document.getElementById('mallory-claim');
  if (aliceInput instanceof HTMLInputElement && !aliceInput.value) {
    aliceInput.value = randomHex(32);
  }

  document.getElementById('btn-deploy')?.addEventListener('click', () => {
    const pk = (aliceInput instanceof HTMLInputElement ? aliceInput.value : '').trim().toLowerCase();
    if (!isHex64(pk)) {
      setStatus('deploy-status', 'Need 32-byte hex (64 chars).', 'fail');
      announce('Deploy failed: invalid hex length');
      return;
    }
    unsafe.ownerPk = pk;
    unsafe.aliceClaim = pk;
    unsafe.forged = false;
    setStatus('deploy-status', `Deployed. owner = ${short(pk)}`, 'ok');
    pushLog(`UNSAFE deploy: owner ← ${short(pk)} (claimed ownPublicKey)`);
    setJourney('deployed', 'Phase: deployed — Mallory can forge by copying Alice’s pk.');
    updateRailsFromState();
    save();
    announce('Unsafe contract deployed');
  });

  document.getElementById('btn-copy-alice')?.addEventListener('click', () => {
    if (malloryInput instanceof HTMLInputElement && unsafe.ownerPk) {
      malloryInput.value = unsafe.ownerPk;
      unsafe.malloryClaim = unsafe.ownerPk;
      setStatus('forge-status', 'Claim field set to Alice’s stored owner pk.', 'warn');
      save();
      announce('Copied Alice pk into Mallory claim');
    } else {
      setStatus('forge-status', 'Deploy first, then copy.', 'fail');
    }
  });

  document.getElementById('btn-forge')?.addEventListener('click', () => {
    if (!unsafe.ownerPk) {
      setStatus('forge-status', 'Deploy first.', 'fail');
      return;
    }
    const claim = (malloryInput instanceof HTMLInputElement ? malloryInput.value : '')
      .trim()
      .toLowerCase();
    unsafe.malloryClaim = claim;
    const result = forgeCanBypass(unsafe.ownerPk, claim);
    if (result.ok) {
      unsafe.forged = true;
      setStatus('forge-status', 'PASS — Mallory forged Alice’s ownPublicKey. Admin gate bypassed.', 'fail');
      pushLog(`FORGE SUCCESS: assert(ownPublicKey()==owner) held for Mallory claim ${short(claim)}`);
      setJourney('forged', 'Phase: forged — theater auth collapsed. Try the safe path below.');
      updateRailsFromState();
      save();
      announce('Forge succeeded. Admin gate bypassed.');
    } else {
      setStatus('forge-status', 'Reject — claim ≠ owner (Mallory forgot to forge).', 'ok');
      pushLog(`Forge failed: claim ${short(claim)} ≠ owner ${short(unsafe.ownerPk)}`);
      save();
      announce('Forge rejected — claim did not match owner');
    }
  });

  document.getElementById('btn-safe-deploy')?.addEventListener('click', async () => {
    safe.aliceSk = randomHex(32);
    safe.ownerDerived = await derivePk(safe.aliceSk, DOMAIN_PK);
    safe.held = false;
    setStatus('safe-status', `Safe deploy. owner = derive(Alice.sk) → ${short(safe.ownerDerived)}`, 'ok');
    pushLog(`SAFE deploy: owner ← derive(sk) ${short(safe.ownerDerived)} (sk stays local)`);
    updateRailsFromState();
    save();
    announce('Safe witness-bound contract deployed');
  });

  document.getElementById('btn-safe-forge')?.addEventListener('click', async () => {
    if (!safe.ownerDerived) {
      setStatus('safe-status', 'Safe-deploy first.', 'fail');
      return;
    }
    const mallorySk = randomHex(32);
    const malloryDerived = await derivePk(mallorySk, DOMAIN_PK);
    if (malloryDerived === safe.ownerDerived) {
      setStatus('safe-status', 'Unexpected collision — rotate and retry.', 'warn');
    } else {
      safe.held = true;
      setStatus(
        'safe-status',
        `REJECT — Mallory derive ${short(malloryDerived)} ≠ owner. Auth holds.`,
        'ok',
      );
      pushLog(`SAFE reject: Mallory cannot match owner without Alice’s secret`);
      setJourney('safe', 'Phase: witness-bound — forger rejected; Alice can still pass.');
      updateRailsFromState();
      save();
      announce('Safe path rejected Mallory');
    }
  });

  document.getElementById('btn-safe-alice')?.addEventListener('click', async () => {
    if (!safe.aliceSk || !safe.ownerDerived) {
      setStatus('safe-status', 'Safe-deploy first.', 'fail');
      return;
    }
    const again = await derivePk(safe.aliceSk, DOMAIN_PK);
    if (again === safe.ownerDerived) {
      safe.held = true;
      setStatus('safe-status', `PASS — Alice proves knowledge of sk → ${short(again)}`, 'ok');
      pushLog(`SAFE pass: Alice adminOnly() with witness-derived pk`);
      setJourney('safe', 'Phase: witness-bound — Alice authenticated via secret knowledge.');
      updateRailsFromState();
      save();
      announce('Alice authenticated on safe path');
    }
  });

  document.getElementById('btn-reset-forge')?.addEventListener('click', () => {
    unsafe.ownerPk = null;
    unsafe.forged = false;
    unsafe.log = [];
    unsafe.aliceClaim = null;
    unsafe.malloryClaim = '';
    safe.ownerDerived = null;
    safe.aliceSk = null;
    safe.held = false;
    if (aliceInput instanceof HTMLInputElement) aliceInput.value = randomHex(32);
    if (malloryInput instanceof HTMLInputElement) malloryInput.value = '';
    setStatus('deploy-status', 'Not deployed.');
    setStatus('forge-status', 'Waiting…');
    setStatus('safe-status', 'Safe contract not deployed.');
    const logEl = document.getElementById('forge-log');
    if (logEl) logEl.textContent = '';
    setJourney('idle', 'Phase: idle — deploy the unsafe contract to begin.');
    updateRailsFromState();
    save();
    announce('Forge theater reset');
  });
}

function collectScoreItems() {
  /** @type {{ id: string, kind: string }[]} */
  const items = [];
  document.querySelectorAll('#score-list input[type=checkbox]').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    items.push({
      id: input.getAttribute('data-id') || '',
      kind: input.getAttribute('data-score') || '',
    });
  });
  return items;
}

function renderScore() {
  const items = collectScoreItems();
  document.querySelectorAll('#score-list input[type=checkbox]').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) return;
    const id = input.getAttribute('data-id') || '';
    input.checked = Boolean(scoreMap[id]);
  });
  const { health, safeN, unsafeN, safeMax } = computeScoreHealth(scoreMap, items);

  const num = document.getElementById('score-num');
  const ring = document.getElementById('score-ring');
  const verdict = document.getElementById('score-verdict');
  if (num) num.textContent = health === null ? '—' : String(health);
  if (ring && health !== null) {
    const deg = Math.round((health / 100) * 360);
    const color = health >= 70 ? 'var(--ok)' : health >= 40 ? 'var(--warn)' : 'var(--danger)';
    ring.style.background = `radial-gradient(circle at center, rgba(8,12,24,0.95) 58%, transparent 59%), conic-gradient(${color} ${deg}deg, rgba(124,156,255,0.12) ${deg}deg)`;
  } else if (ring) {
    ring.style.background = '';
  }
  if (verdict) {
    if (health === null) {
      verdict.textContent = 'Check items to grade your design.';
      verdict.className = 'status';
    } else if (unsafeN > 0 && safeN < 2) {
      verdict.textContent = `At risk — ${unsafeN} forgeable pattern(s) still checked.`;
      verdict.className = 'status fail';
    } else if (health >= 70) {
      verdict.textContent = `Solid — ${safeN}/${safeMax} safe practices · ${unsafeN} anti-patterns.`;
      verdict.className = 'status ok';
    } else {
      verdict.textContent = `Mixed — raise safe checks, clear anti-patterns.`;
      verdict.className = 'status warn';
    }
  }
}

function initScorecard() {
  document.querySelectorAll('#score-list input[type=checkbox]').forEach((input) => {
    input.addEventListener('change', () => {
      if (!(input instanceof HTMLInputElement)) return;
      const id = input.getAttribute('data-id') || '';
      if (input.checked) scoreMap[id] = true;
      else delete scoreMap[id];
      save();
      renderScore();
      announce('Scorecard updated');
    });
  });
  document.getElementById('btn-score-reset')?.addEventListener('click', () => {
    scoreMap = {};
    save();
    renderScore();
    announce('Scorecard cleared');
  });
}

async function renderBoard() {
  if (!boardSk) boardSk = randomHex(32);
  const pk = await derivePk(boardSk, DOMAIN_BOARD);
  const skEl = document.getElementById('my-sk');
  const pkEl = document.getElementById('my-pk');
  if (skEl) skEl.textContent = boardSk;
  if (pkEl) pkEl.textContent = `pk: ${pk}`;

  const list = document.getElementById('post-list');
  const count = document.getElementById('post-count');
  if (count) count.textContent = `(${posts.length})`;
  if (!list) return;

  if (!posts.length) {
    list.innerHTML = `<li class="empty empty-rich" role="status">
        <div class="empty-glyph" aria-hidden="true">⬡</div>
        <strong>Board vacant</strong>
        <span class="muted small">Post the first message bound to your local witness pk. Take-down needs the same secret — MPS-0029 style. LOCAL-TRUE · not on-chain.</span>
        <button type="button" class="btn ghost small" id="empty-focus-post">Write a post</button>
      </li>`;
    queueMicrotask(() => {
      document.getElementById('empty-focus-post')?.addEventListener('click', () => {
        const el = document.getElementById('post-body');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      });
    });
    return;
  }

  list.innerHTML = posts
    .map((p) => {
      const mine = p.ownerPk === pk;
      return `<li class="post-item" data-id="${escapeHtml(p.id)}">
        <div class="meta">
          <span>seq ${p.seq}</span>
          <span>owner ${short(p.ownerPk, 8)}</span>
          <span>${new Date(p.ts).toLocaleString()}</span>
          ${mine ? '<span style="color:var(--ok)">you</span>' : ''}
        </div>
        <p class="body"></p>
        <div class="actions">
          ${
            mine
              ? `<button type="button" class="btn danger small" data-take-down="${escapeHtml(p.id)}">Take down</button>`
              : `<span class="muted small">Only owner pk can take down</span>`
          }
        </div>
      </li>`;
    })
    .join('');

  [...list.querySelectorAll('.post-item')].forEach((li) => {
    const id = li.getAttribute('data-id');
    const p = posts.find((x) => x.id === id);
    const body = li.querySelector('.body');
    if (body && p) body.textContent = p.body;
  });

  list.querySelectorAll('[data-take-down]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-take-down');
      const myPk = await derivePk(boardSk, DOMAIN_BOARD);
      const target = posts.find((x) => x.id === id);
      if (!target || target.ownerPk !== myPk) {
        announce('Take-down denied — not your derived pk. Honest MPS-0029 reject · LOCAL-TRUE.');
        return;
      }
      posts = posts.filter((x) => x.id !== id);
      save();
      renderBoard();
      announce('Post taken down');
    });
  });
}

function initBoard() {
  const ta = document.getElementById('post-body');
  const counter = document.getElementById('char-count');
  const syncCount = () => {
    if (ta instanceof HTMLTextAreaElement && counter) {
      counter.textContent = `${ta.value.length} / 280`;
    }
  };
  ta?.addEventListener('input', syncCount);
  syncCount();

  document.getElementById('btn-rotate-sk')?.addEventListener('click', () => {
    boardSk = randomHex(32);
    save();
    renderBoard();
    announce('Local secret rotated');
  });

  document.getElementById('btn-copy-pk')?.addEventListener('click', async () => {
    const pk = await derivePk(boardSk, DOMAIN_BOARD);
    try {
      await navigator.clipboard.writeText(pk);
      announce('Public key copied');
    } catch {
      announce('Copy failed');
    }
  });

  document.getElementById('btn-post')?.addEventListener('click', async () => {
    const body = (ta instanceof HTMLTextAreaElement ? ta.value : '').trim();
    if (!body) {
      setBoardError('Post body empty — LOCAL-TRUE will not invent content.');
      announce('Post body empty');
      document.getElementById('post-body')?.focus();
      return;
    }
    const pk = await derivePk(boardSk, DOMAIN_BOARD);
    posts.unshift({
      id: randomHex(8),
      seq: posts.length + 1,
      body,
      ownerPk: pk,
      ts: Date.now(),
    });
    save();
    if (ta instanceof HTMLTextAreaElement) ta.value = '';
    syncCount();
    renderBoard();
    setBoardError('');
    announce('Post published to local board');
    document.getElementById('btn-post')?.classList.add('seal-flash');
    setTimeout(() => document.getElementById('btn-post')?.classList.remove('seal-flash'), 600);
  });

  document.getElementById('btn-clear-board')?.addEventListener('click', () => {
    if (confirm('Clear all local posts?')) {
      posts = [];
      save();
      renderBoard();
      announce('Board cleared');
    }
  });
}

function scanWallets(silent = false) {
  const grid = document.getElementById('wallet-grid');
  const status = document.getElementById('wallet-status');
  if (!grid || !status) return;

  const midnight = typeof window !== 'undefined' ? window.midnight : undefined;
  if (!midnight || typeof midnight !== 'object') {
    status.textContent = silent
      ? 'Watching… window.midnight not found.'
      : 'window.midnight not found — install Lace (or another Midnight wallet) and reload.';
    status.className = 'status warn';
    if (!silent) {
      grid.innerHTML = `<div class="empty empty-rich" role="status">
          <div class="empty-glyph" aria-hidden="true">◇</div>
          <strong>No Midnight providers</strong>
          <span class="muted small">window.midnight not found. Hardcoding mnLace would also fail here. Read-only scan — no connect. LOCAL-TRUE honesty.</span>
        </div>`;
    }
    return;
  }

  const entries = Object.entries(midnight);
  status.textContent = `Found ${entries.length} injection key(s).`;
  status.className = 'status ok';

  grid.innerHTML = entries
    .map(([key, api]) => {
      const name = api && typeof api === 'object' && 'name' in api ? String(api.name) : '(no name)';
      const rdns = api && typeof api === 'object' && 'rdns' in api ? String(api.rdns) : '—';
      const ver = api && typeof api === 'object' && 'apiVersion' in api ? String(api.apiVersion) : '—';
      const connectable = api && typeof api.connect === 'function';
      return `<article class="wallet-card">
          <h4>${escapeHtml(name)}</h4>
          <div class="kv">key: ${escapeHtml(key)}</div>
          <div class="kv">rdns: ${escapeHtml(rdns)}</div>
          <div class="kv">apiVersion: ${escapeHtml(ver)}</div>
          <div class="kv">connect: ${connectable ? 'yes (not called)' : 'no'}</div>
        </article>`;
    })
    .join('');
}

function initWallets() {
  document.getElementById('btn-scan-wallets')?.addEventListener('click', () => {
    scanWallets(false);
    announce('Wallet scan complete');
  });

  document.getElementById('chk-watch')?.addEventListener('change', (e) => {
    const on = e.target instanceof HTMLInputElement && e.target.checked;
    if (watchTimer) {
      clearInterval(watchTimer);
      watchTimer = 0;
    }
    if (on) {
      scanWallets(true);
      watchTimer = window.setInterval(() => scanWallets(true), 2000);
      announce('Injection watch on');
    } else {
      announce('Injection watch off');
    }
  });
}

async function copyDonate(btn) {
  try {
    await navigator.clipboard.writeText(DONATE_ADDR);
    if (btn) {
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => {
        btn.textContent = prev;
      }, 1200);
    }
    announce('Donation address copied');
  } catch {
    announce('Copy failed');
  }
}

function initDonate() {
  document.getElementById('copy-addr')?.addEventListener('click', (e) => {
    copyDonate(e.currentTarget instanceof HTMLElement ? e.currentTarget : null);
  });
  document.getElementById('dock-copy-addr')?.addEventListener('click', (e) => {
    copyDonate(e.currentTarget instanceof HTMLElement ? e.currentTarget : null);
  });
}

function initPersistControls() {
  document.getElementById('btn-export')?.addEventListener('click', exportStudio);
  document.getElementById('btn-import')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });
  document.getElementById('import-file')?.addEventListener('change', (e) => {
    const file = e.target instanceof HTMLInputElement ? e.target.files?.[0] : null;
    importStudioFromFile(file).catch(console.error);
    if (e.target instanceof HTMLInputElement) e.target.value = '';
  });
  document.getElementById('btn-reset-studio')?.addEventListener('click', resetStudio);
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
initPersistControls();
load();
startTabSync();
