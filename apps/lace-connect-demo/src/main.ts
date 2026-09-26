/**
 * Lace Midnight Connect Studio — discovery + connect journey + capability probe.
 * Does NOT perform or claim mainnet / Preprod transfers.
 */
import './style.css';
import {
  CONNECT_JOURNEY_STEPS,
  DEMO_MODE_LABEL,
  KIT_VERSION,
  LAB_BRANDING,
  LACE_MIDNIGHT_WORKAROUNDS,
  MidnightNetworkIds,
  advanceConnectJourney,
  connectWithProvider,
  createConnectJourney,
  createDemoCapabilityProbe,
  createDemoSession,
  discoverProviders,
  formatAddress,
  formatInjectionKey,
  isDemoSession,
  journeyStepIndex,
  normalizeConnectorError,
  probeSessionCapabilities,
  probeStatusMatrix,
  safeIconUrl,
  safeWalletLabel,
  userHintForError,
  watchMidnightInjection,
  type CapabilityProbe,
  type ConnectJourneyState,
  type ConnectedSession,
  type DiscoveredProvider,
  type InjectionWatcher,
  type StatusMatrix,
} from '@kshot/lace-midnight-kit';

const NETWORKS = [
  {
    id: MidnightNetworkIds.Preprod,
    label: 'preprod',
    hint: 'Test — default',
    tone: 'ok' as const,
  },
  {
    id: MidnightNetworkIds.Preview,
    label: 'preview',
    hint: 'Test',
    tone: 'ok' as const,
  },
  {
    id: MidnightNetworkIds.Undeployed,
    label: 'undeployed',
    hint: 'Local',
    tone: 'info' as const,
  },
  {
    id: MidnightNetworkIds.Mainnet,
    label: 'mainnet',
    hint: 'Connect only — no transfer demo',
    tone: 'warn' as const,
  },
] as const;

const LS_NETWORK = 'midnight-lab.lace.networkId';
const LS_DEMO = 'midnight-lab.lace.demoMode';

type AppState = {
  providers: DiscoveredProvider[];
  selectedKey: string | null;
  networkId: string;
  session: ConnectedSession | null;
  matrix: StatusMatrix | null;
  journey: ConnectJourneyState;
  capabilities: CapabilityProbe | null;
  demoMode: boolean;
  watching: boolean;
  log: string[];
  announce: string;
  connecting: boolean;
};

function loadNetwork(): string {
  try {
    const v = localStorage.getItem(LS_NETWORK);
    if (v && NETWORKS.some((n) => n.id === v)) return v;
  } catch {
    /* ignore */
  }
  return MidnightNetworkIds.Preprod;
}

function loadDemoFlag(): boolean {
  try {
    return localStorage.getItem(LS_DEMO) === '1';
  } catch {
    return false;
  }
}

const state: AppState = {
  providers: [],
  selectedKey: null,
  networkId: loadNetwork(),
  session: null,
  matrix: null,
  journey: createConnectJourney('idle'),
  capabilities: null,
  demoMode: loadDemoFlag(),
  watching: false,
  log: [],
  announce: '',
  connecting: false,
};

let watcher: InjectionWatcher | null = null;
let focusRestore: string | null = null;

function log(line: string): void {
  const stamp = new Date().toLocaleTimeString();
  state.log.unshift(`[${stamp}] ${line}`);
  if (state.log.length > 50) state.log.length = 50;
}

function announce(msg: string): void {
  state.announce = msg;
}

function setJourney(
  phase: Parameters<typeof advanceConnectJourney>[1],
  detail?: string,
): void {
  state.journey = advanceConnectJourney(state.journey, phase, detail);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

async function copyText(text: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    log(`Copied ${label}.`);
    announce(`Copied ${label} to clipboard`);
  } catch {
    log(`Copy failed for ${label}.`);
    announce(`Copy failed for ${label}`);
  }
}

/* —— Starfield —— */
function initStarfield(): void {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0;
  let h = 0;
  let stars: { x: number; y: number; r: number; a: number; s: number }[] = [];
  let raf = 0;

  const resize = (): void => {
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

  const draw = (): void => {
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

function refreshMatrix(): void {
  try {
    state.matrix = probeStatusMatrix({ apiVersionRange: '^4.0.0' });
    log(
      `Matrix: midnight=${state.matrix.hasMidnightObject} keys=${state.matrix.injectionKeyCount} providers=${state.matrix.providers.length} v4=${state.matrix.compatibleV4Count}`,
    );
  } catch (err) {
    const e = normalizeConnectorError(err);
    log(`Matrix error: ${e.code} — ${userHintForError(e)}`);
  }
}

function refreshDiscovery(silent = false): void {
  try {
    setJourney('discovering');
    const result = discoverProviders({ apiVersionRange: '^4.0.0' });
    state.providers =
      result.compatible.length > 0 ? result.compatible : result.providers;
    if (state.providers.length && !state.selectedKey) {
      state.selectedKey = state.providers[0]!.injectionKey;
    }
    if (state.providers.length === 0) {
      state.selectedKey = null;
      setJourney('idle', 'No wallet on window.midnight yet');
    } else {
      setJourney('ready_to_connect', `${state.providers.length} provider(s) ready`);
    }
    if (!silent) {
      if (result.hasDuplicateRdns) {
        log('Warning: duplicate rdns among providers — choose carefully.');
      }
      log(
        state.providers.length
          ? `Discovered ${state.providers.length} provider(s).`
          : 'No providers on window.midnight (Lace not injected).',
      );
    }
  } catch (err) {
    const e = normalizeConnectorError(err);
    setJourney('error', userHintForError(e));
    log(`Discovery error: ${e.code} — ${userHintForError(e)}`);
  }
}

function startWatcher(): void {
  if (watcher) return;
  watcher = watchMidnightInjection(
    (snap) => {
      if (!snap.changed && state.providers.length) return;
      const prev = state.providers.length;
      refreshDiscovery(true);
      refreshMatrix();
      if (state.providers.length !== prev) {
        log(
          snap.hasMidnight
            ? `Injection watch: ${snap.injectionKeyCount} key(s), ${state.providers.length} provider(s).`
            : 'Injection watch: window.midnight still absent.',
        );
        announce(
          state.providers.length
            ? `Wallet detected: ${state.providers.length} provider(s)`
            : 'Still waiting for Lace injection',
        );
        render();
      }
    },
    { intervalMs: 2000, immediate: true },
  );
  state.watching = true;
}

function stopWatcher(): void {
  watcher?.stop();
  watcher = null;
  state.watching = false;
}

async function handleConnect(): Promise<void> {
  if (state.demoMode) {
    state.session = createDemoSession(state.networkId);
    state.capabilities = createDemoCapabilityProbe();
    setJourney('connected', DEMO_MODE_LABEL);
    log(`Demo mode session on ${state.networkId} — ${DEMO_MODE_LABEL}`);
    announce('Simulated session ready — not a real Lace connection');
    render();
    return;
  }

  const provider = state.providers.find((p) => p.injectionKey === state.selectedKey);
  if (!provider) {
    log('Select a wallet first.');
    announce('Select a wallet first');
    render();
    return;
  }

  state.connecting = true;
  setJourney('awaiting_wallet', `Approve in ${safeWalletLabel(provider.api)}…`);
  log(`Connecting to ${safeWalletLabel(provider.api)} on networkId=${state.networkId}…`);
  announce(`Connecting on ${state.networkId}`);
  render();

  try {
    setJourney('reading_status');
    const session = await connectWithProvider(provider, {
      networkId: state.networkId,
      assertNetworkMatch: true,
      hintUsage: [
        'getConnectionStatus',
        'getUnshieldedAddress',
        'getConfiguration',
      ],
    });
    setJourney('reading_addresses');
    state.session = session;
    try {
      state.capabilities = await probeSessionCapabilities(session.api);
      log(
        `Capability probe: ${state.capabilities.okCount}/${state.capabilities.rows.length} read methods ok.`,
      );
    } catch (err) {
      const e = normalizeConnectorError(err);
      log(`Capability probe partial: ${e.message}`);
      state.capabilities = null;
    }
    setJourney('connected', `Connected on ${session.networkId}`);
    log(
      `Connected. status=${session.status.status} network=${session.networkId} unshielded=${session.addresses.unshieldedAddress ?? 'n/a'}`,
    );
    announce(`Connected on ${session.networkId}`);
  } catch (err) {
    const e = normalizeConnectorError(err);
    setJourney('error', userHintForError(e));
    log(`Connect failed: [${e.code}] ${e.message}`);
    log(`Hint: ${userHintForError(e)}`);
    announce(`Connect failed: ${e.code}`);
    state.session = null;
    state.capabilities = null;
  } finally {
    state.connecting = false;
    render();
  }
}

function statusClass(s: string): string {
  if (s === 'ok') return 'mx-ok';
  if (s === 'warn') return 'mx-warn';
  if (s === 'bad') return 'mx-bad';
  if (s === 'info') return 'mx-info';
  if (s === 'denied') return 'mx-warn';
  if (s === 'unavailable') return 'mx-bad';
  if (s === 'skipped') return 'mx-info';
  return 'mx-unknown';
}

function renderJourney(): string {
  const idx = journeyStepIndex(state.journey.phase);
  const err = state.journey.phase === 'error';
  const steps = CONNECT_JOURNEY_STEPS.map((step, i) => {
    let cls = 'journey-step';
    if (err) cls += i === 0 ? ' is-idle' : '';
    else if (i < idx) cls += ' is-done';
    else if (i === idx) cls += ' is-active';
    return `<li class="${cls}" data-phase="${escapeAttr(step.id)}">
      <span class="journey-dot" aria-hidden="true"></span>
      <span class="journey-label">${escapeHtml(step.label)}</span>
    </li>`;
  }).join('');
  return `
    <ol class="journey ${err ? 'is-error' : ''}" aria-label="Connect journey">
      ${steps}
    </ol>
    <p class="journey-detail" id="journey-detail" aria-live="polite">
      <strong>${escapeHtml(state.journey.phase)}</strong>
      — ${escapeHtml(state.journey.detail)}
      ${state.demoMode ? `<span class="mx-pill mx-warn">${escapeHtml(DEMO_MODE_LABEL)}</span>` : ''}
      ${isDemoSession(state.session) ? '<span class="mx-pill mx-warn">simulated session</span>' : ''}
    </p>
  `;
}

function renderMatrix(matrix: StatusMatrix | null): string {
  if (!matrix) {
    return `<p class="muted">Matrix not probed yet.</p>`;
  }
  const rows = matrix.rows
    .map(
      (r) => `<tr>
        <td><span class="mx-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></td>
        <td>${escapeHtml(r.label)}</td>
        <td class="muted">${escapeHtml(r.detail)}</td>
      </tr>`,
    )
    .join('');
  const providers =
    matrix.providers.length === 0
      ? `<p class="muted" style="margin:0.65rem 0 0">No providers enumerated yet.</p>`
      : `<div class="mx-providers">${matrix.providers
          .map(
            (p) => `<div class="mx-card">
              <div>
                <strong class="mx-pname" data-key="${escapeAttr(p.injectionKey)}"></strong>
                ${p.isLegacyMnLaceKey ? '<span class="mx-pill mx-info">mnLace key</span>' : ''}
                ${p.compatibleV4 ? '<span class="mx-pill mx-ok">^4</span>' : '<span class="mx-pill mx-warn">not ^4</span>'}
              </div>
              <div class="muted mono">rdns=${escapeHtml(p.rdns || '(none)')} · api=${escapeHtml(p.apiVersion || '?')} · key=${escapeHtml(formatInjectionKey(p.injectionKey))}</div>
              <div class="muted">connect=${p.hasConnect ? 'yes' : 'no'} · enable(legacy)=${p.hasEnable ? 'yes' : 'no'}</div>
            </div>`,
          )
          .join('')}</div>`;
  return `
    <div class="mx-table-wrap" role="region" aria-label="Status matrix table" tabindex="0">
      <table class="mx-table">
        <thead><tr><th scope="col">Status</th><th scope="col">Check</th><th scope="col">Detail</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${providers}
  `;
}

function renderCapabilities(probe: CapabilityProbe | null): string {
  if (!probe) {
    return `<p class="muted">Connect to run a read-only capability probe. Transfers are never called.</p>`;
  }
  const chips = probe.rows
    .map(
      (r) => `<div class="cap-chip ${statusClass(r.status)}" title="${escapeAttr(r.detail)}">
        <span class="cap-status">${escapeHtml(r.status)}</span>
        <span class="cap-label">${escapeHtml(r.label)}</span>
        <span class="cap-method mono">${escapeHtml(r.method)}</span>
      </div>`,
    )
    .join('');
  return `
    <p class="muted cap-note">${escapeHtml(probe.scopeNote)}</p>
    <div class="cap-grid" role="list">${chips}</div>
  `;
}

function renderSession(session: ConnectedSession | null): string {
  if (!session) {
    return `<p class="muted">Not connected. Pick a network, select a wallet, then Connect — or enable Demo mode for a simulated session.</p>`;
  }
  const st = session.status;
  const statusText =
    st.status === 'connected'
      ? `connected · networkId=${st.networkId}`
      : 'disconnected';
  const demo = isDemoSession(session);
  const addrs = [
    { id: 'unshielded', label: 'Unshielded', value: session.addresses.unshieldedAddress },
    { id: 'shielded', label: 'Shielded', value: session.addresses.shieldedAddress },
    { id: 'dust', label: 'Dust', value: session.addresses.dustAddress },
  ];
  return `
    <div class="session-banner ${demo ? 'is-demo' : 'is-live'}" role="status">
      ${demo ? `<strong>${escapeHtml(DEMO_MODE_LABEL)}</strong> — placeholders only.` : '<strong>Live Lace session</strong> — still connect-only; no transfers.'}
    </div>
    <div class="addr-grid">
      ${addrs
        .map((a) => {
          const full = a.value ?? '';
          const shown = formatAddress(a.value);
          return `<article class="addr-card">
            <header>
              <span class="addr-label">${escapeHtml(a.label)}</span>
              <button type="button" class="ghost small btn-copy" data-copy="${escapeAttr(full)}" data-label="${escapeAttr(a.label)}" ${full ? '' : 'disabled'}>Copy</button>
            </header>
            <code class="addr-value mono" title="${escapeAttr(full || '(unavailable)')}">${escapeHtml(shown)}</code>
          </article>`;
        })
        .join('')}
    </div>
    <div class="kv" style="margin-top:0.85rem">
      <div><span class="k">Status</span><span class="v ok">${escapeHtml(statusText)}</span></div>
      <div><span class="k">Requested</span><span class="v">${escapeHtml(session.networkId)}</span></div>
      <div><span class="k">Wallet</span><span class="v">${escapeHtml(safeWalletLabel(session.provider.api))} (${escapeHtml(session.provider.api.rdns)})</span></div>
      <div><span class="k">Indexer</span><span class="v">${escapeHtml(session.configuration?.indexerUri ?? '(config unavailable)')}</span></div>
    </div>
  `;
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const active = document.activeElement as HTMLElement | null;
  focusRestore = active?.id || active?.getAttribute?.('data-key') || null;

  const hasLace = state.providers.length > 0;
  const connected = state.session !== null;

  app.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>

    <header class="topbar" id="topbar">
      <a class="logo" href="../" aria-label="Midnight Lab home">Lace<span>Studio</span></a>
      <button type="button" class="nav-toggle" id="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">☰</button>
      <nav id="site-nav" aria-label="Primary">
        <a href="#journey">Journey</a>
        <a href="#matrix">Matrix</a>
        <a href="#wallets">Wallets</a>
        <a href="#session">Session</a>
        <a href="#caps">Capabilities</a>
        <a href="#workarounds">Workarounds</a>
        <a href="#donate">Donate</a>
        <a href="../">Lab home</a>
        <a href="${LAB_BRANDING.repoUrl}" rel="noopener noreferrer">Repo</a>
        <a href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
      </nav>
      <span class="badge badge-demo" title="Connect-only scope">LOCAL STUB · CONNECT ONLY · kit ${escapeHtml(KIT_VERSION)}</span>
    </header>

    <aside class="donate-dock" aria-label="Always-visible donate">
      <a class="dock-x" href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
      <span class="dock-sep" aria-hidden="true">·</span>
      <button type="button" class="dock-copy" id="dock-copy-addr" title="Copy Cardano donation address">Donate ADA</button>
    </aside>

    <main id="main" class="wrap">
      <div class="sr-only" id="live-region" aria-live="polite" aria-atomic="true">${escapeHtml(state.announce)}</div>

      <section class="hero" id="top">
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span> Lace · Midnight DApp Connector 4.0.1</p>
        <h1>Connect Studio</h1>
        <p class="lede">
          World-class discovery + connect UX on top of
          <code>@kshot/lace-midnight-kit@${escapeHtml(KIT_VERSION)}</code>
          and official <code>@midnight-ntwrk/dapp-connector-api@4.0.1</code>.
          Journey stepper, injection watch, status matrix, and read-only capability radar.
          By <a href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
          · <a href="${LAB_BRANDING.nightDreamUrl}" rel="noopener noreferrer">NightDream.io</a>.
        </p>
        <div class="cta-row">
          <a class="btn primary" href="#wallets">Open wallets</a>
          <a class="btn ghost" href="https://www.lace.io/" rel="noopener noreferrer">Get Lace</a>
          <a class="btn ghost" href="https://docs.midnight.network/guides/react-wallet-connect" rel="noopener noreferrer">Official guide</a>
          <a class="btn ghost" href="#donate">Donate ADA</a>
        </div>
        <div class="honesty" role="note">
          <strong>Honest capabilities:</strong> discovery + <code>connect(networkId)</code> + status / addresses / config.
          Does <strong>not</strong> call <code>makeTransfer</code>, balance, or submit.
          A green connect is <strong>not</strong> proof that mainnet (or any) transfers work.
          Prefer <strong>preprod / preview</strong>. Lace is <strong>browser-only</strong>.
          ${state.demoMode ? `<br/><strong>Demo mode ON</strong> — ${escapeHtml(DEMO_MODE_LABEL)}.` : ''}
        </div>
      </section>

      <section class="panel journey-panel reveal" id="journey" aria-labelledby="journey-heading">
        <div class="section-head">
          <h2 id="journey-heading">Connect journey</h2>
          <p class="muted">Labeled phases from idle → connected. Error is a parallel state, not a silent failure.</p>
        </div>
        ${renderJourney()}
        <div class="row" style="margin-top:0.85rem;margin-bottom:0">
          <label class="toggle">
            <input type="checkbox" id="chk-demo" ${state.demoMode ? 'checked' : ''} />
            <span>Demo mode (simulated session — no Lace required)</span>
          </label>
          <label class="toggle">
            <input type="checkbox" id="chk-watch" ${state.watching ? 'checked' : ''} />
            <span>Watch injection (poll window.midnight)</span>
          </label>
        </div>
      </section>

      <section class="panel matrix-panel reveal" id="matrix" aria-labelledby="matrix-heading">
        <div class="section-head">
          <h2 id="matrix-heading">Connect status matrix</h2>
          <p class="muted">Live probe of <code>window.midnight</code> — enumeration vs legacy <code>mnLace</code>, API ^4.0.0, duplicate <code>rdns</code>. Read-only.</p>
        </div>
        ${renderMatrix(state.matrix)}
        <div class="row" style="margin-top:0.75rem;margin-bottom:0">
          <button type="button" class="ghost" id="btn-matrix">Refresh matrix</button>
          <span class="muted mono" style="font-size:0.78rem">${
            state.matrix
              ? `keys: ${(state.matrix.injectionKeysPreview || []).join(', ') || '(none)'} · v4=${state.matrix.compatibleV4Count} · mnLace=${state.matrix.legacyMnLacePresent ? 'present' : 'absent'}`
              : 'Matrix not probed yet.'
          }</span>
        </div>
      </section>

      <section class="panel reveal" id="wallets" aria-labelledby="wallets-heading">
        <div class="section-head">
          <h2 id="wallets-heading">1. Discover providers</h2>
          <p class="muted">Never hardcode <code>window.midnight.mnLace</code> — Lace injects under a UUID key each load.</p>
        </div>
        <div class="row">
          <button type="button" id="btn-refresh">Refresh discovery</button>
          <span class="status-pill ${hasLace ? 'on' : 'off'}" role="status">
            ${hasLace ? `${state.providers.length} wallet(s) found` : 'No wallet on window.midnight'}
          </span>
        </div>
        ${
          hasLace
            ? `<ul class="wallet-list" id="wallet-list" role="listbox" aria-label="Midnight wallets" aria-activedescendant="${
                state.selectedKey ? `wallet-${escapeAttr(state.selectedKey)}` : ''
              }">${state.providers
                .map((p) => {
                  const icon = safeIconUrl(p.api);
                  const selected = p.injectionKey === state.selectedKey;
                  return `<li role="option" id="wallet-${escapeAttr(p.injectionKey)}" data-key="${escapeAttr(p.injectionKey)}" class="${selected ? 'selected' : ''}" aria-selected="${selected ? 'true' : 'false'}" tabindex="${selected ? '0' : '-1'}">
                    ${icon ? `<img alt="" src="${escapeAttr(icon)}" width="32" height="32" />` : '<span class="wallet-glyph" aria-hidden="true">◇</span>'}
                    <div>
                      <div><span class="wallet-name"></span></div>
                      <div class="muted mono">rdns: ${escapeHtml(p.api.rdns || '(none)')} · api ${escapeHtml(p.api.apiVersion)} · key ${escapeHtml(formatInjectionKey(p.injectionKey))}</div>
                    </div>
                  </li>`;
                })
                .join('')}</ul>`
            : `<div class="empty-state" role="status">
                <div class="empty-art" aria-hidden="true">⬡</div>
                <h3>Lace not detected</h3>
                <p class="muted">
                  Install <a href="https://www.lace.io/" rel="noopener noreferrer">Lace</a>,
                  enable Midnight, refresh this tab, then click Refresh discovery —
                  or turn on <strong>Demo mode</strong> above to explore the UI with a simulated session.
                </p>
              </div>`
        }
      </section>

      <section class="panel reveal" id="session" aria-labelledby="session-heading">
        <div class="section-head">
          <h2 id="session-heading">2. Connect (read-only)</h2>
          <p class="muted">Default is <strong>preprod</strong>. Mainnet is connect/status only — no transfers.</p>
        </div>
        <div class="network-pills" role="radiogroup" aria-label="Network id">
          ${NETWORKS.map((n) => {
            const checked = n.id === state.networkId;
            return `<button type="button" class="net-pill tone-${n.tone} ${checked ? 'is-active' : ''}" role="radio" aria-checked="${checked}" data-network="${escapeAttr(n.id)}" id="net-${escapeAttr(n.id)}">
              <span class="net-id">${escapeHtml(n.label)}</span>
              <span class="net-hint">${escapeHtml(n.hint)}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="row" style="margin-top:0.85rem">
          <button type="button" id="btn-connect" ${hasLace || state.demoMode ? '' : 'disabled'} ${state.connecting ? 'aria-busy="true"' : ''}>
            ${state.connecting ? 'Connecting…' : state.demoMode ? 'Start demo session' : 'Connect'}
          </button>
          <button type="button" class="ghost" id="btn-disconnect" ${connected ? '' : 'disabled'}>Clear session</button>
        </div>
        <div id="session-panel">${renderSession(state.session)}</div>
      </section>

      <section class="panel caps-panel reveal" id="caps" aria-labelledby="caps-heading">
        <div class="section-head">
          <h2 id="caps-heading">3. Capability radar</h2>
          <p class="muted">Post-connect read-only probe. <code>makeTransfer</code> is listed as skipped on purpose.</p>
        </div>
        ${renderCapabilities(state.capabilities)}
      </section>

      <section class="panel reveal" id="log-panel" aria-labelledby="log-heading">
        <h2 id="log-heading">Activity log</h2>
        <pre class="log" id="log" tabindex="0">${escapeHtml(state.log.join('\n') || 'Ready.')}</pre>
      </section>

      <section class="panel reveal" id="workarounds" aria-labelledby="wa-heading">
        <h2 id="wa-heading">Documented Lace workarounds</h2>
        <ul class="hints">
          ${LACE_MIDNIGHT_WORKAROUNDS.map(
            (w) =>
              `<li><strong>${escapeHtml(w.title)}</strong> — ${escapeHtml(w.mitigation)}</li>`,
          ).join('')}
        </ul>
        <p class="muted" style="margin-top:0.75rem">
          Official:
          <a href="https://docs.midnight.network/guides/react-wallet-connect" rel="noopener noreferrer">React wallet connect</a>
          ·
          <a href="https://github.com/midnightntwrk/midnight-dapp-connector-api" rel="noopener noreferrer">dapp-connector-api</a>
          ·
          <a href="https://www.lace.io/" rel="noopener noreferrer">lace.io</a>
        </p>
      </section>

      <footer class="site-footer" id="donate">
        <div>
          <strong>Midnight GrokBot Agent</strong>
          · MIT · by <a href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
          · <a href="${LAB_BRANDING.nightDreamUrl}" rel="noopener noreferrer">NightDream.io</a>
          · <a href="${LAB_BRANDING.repoUrl}" rel="noopener noreferrer">GitHub</a>
        </div>
        <div class="footer-donate">
          <span>Donate ADA:</span>
          <code id="donate-addr">${LAB_BRANDING.donationAddressAda}</code>
          <button type="button" class="ghost small" id="btn-copy-donate">Copy address</button>
        </div>
        <p class="disclaimer">
          Not affiliated with the Midnight Foundation or Input Output.
          This studio does not claim mainnet transfers or live GitHub Pages until Actions are enabled.
          Verify versions against Midnight’s compatibility matrix before production use.
        </p>
      </footer>
    </main>
  `;

  // Fill provider names via text nodes (XSS-safe)
  app.querySelectorAll('.mx-pname').forEach((el) => {
    const key = el.getAttribute('data-key');
    const provider = state.matrix?.providers.find((p) => p.injectionKey === key);
    if (provider) el.textContent = provider.name;
  });
  app.querySelectorAll('.wallet-list li').forEach((li) => {
    const key = li.getAttribute('data-key');
    const provider = state.providers.find((p) => p.injectionKey === key);
    const nameEl = li.querySelector('.wallet-name');
    if (nameEl && provider) nameEl.textContent = safeWalletLabel(provider.api);
  });

  bindEvents(app);
  restoreFocus(app);
}

function restoreFocus(app: HTMLElement): void {
  if (!focusRestore) return;
  const byId = app.querySelector(`#${CSS.escape(focusRestore)}`) as HTMLElement | null;
  if (byId) {
    byId.focus();
    return;
  }
  const byKey = app.querySelector(`[data-key="${CSS.escape(focusRestore)}"]`) as HTMLElement | null;
  byKey?.focus();
}

function bindEvents(app: HTMLElement): void {
  const navToggle = app.querySelector('#nav-toggle') as HTMLButtonElement | null;
  const nav = app.querySelector('#site-nav');
  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.getElementById('btn-refresh')?.addEventListener('click', () => {
    refreshDiscovery();
    refreshMatrix();
    render();
  });

  document.getElementById('btn-matrix')?.addEventListener('click', () => {
    refreshMatrix();
    render();
  });

  document.getElementById('btn-connect')?.addEventListener('click', () => {
    void handleConnect();
  });

  document.getElementById('btn-disconnect')?.addEventListener('click', () => {
    state.session = null;
    state.capabilities = null;
    setJourney(
      state.providers.length ? 'ready_to_connect' : 'idle',
      'Cleared local session (connector has no global disconnect)',
    );
    log('Cleared local session (connector has no global disconnect).');
    announce('Session cleared');
    render();
  });

  document.getElementById('chk-demo')?.addEventListener('change', (e) => {
    state.demoMode = (e.target as HTMLInputElement).checked;
    try {
      localStorage.setItem(LS_DEMO, state.demoMode ? '1' : '0');
    } catch {
      /* ignore */
    }
    if (!state.demoMode && isDemoSession(state.session)) {
      state.session = null;
      state.capabilities = null;
      setJourney(state.providers.length ? 'ready_to_connect' : 'idle');
    }
    log(state.demoMode ? `Demo mode ON — ${DEMO_MODE_LABEL}` : 'Demo mode OFF');
    announce(state.demoMode ? 'Demo mode enabled' : 'Demo mode disabled');
    render();
  });

  document.getElementById('chk-watch')?.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked;
    if (on) {
      startWatcher();
      log('Injection watch started (2s poll).');
    } else {
      stopWatcher();
      log('Injection watch stopped.');
    }
    render();
  });

  app.querySelectorAll('.net-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-network');
      if (!id) return;
      state.networkId = id;
      try {
        localStorage.setItem(LS_NETWORK, id);
      } catch {
        /* ignore */
      }
      log(`Network set to ${id}`);
      render();
    });
  });

  const walletList = app.querySelector('#wallet-list');
  walletList?.querySelectorAll('li').forEach((li) => {
    li.addEventListener('click', () => {
      state.selectedKey = li.getAttribute('data-key');
      log(`Selected provider key=${formatInjectionKey(state.selectedKey || '')}`);
      render();
    });
    li.addEventListener('keydown', (ev) => {
      const e = ev as KeyboardEvent;
      const items = [...walletList.querySelectorAll('li')];
      const i = items.indexOf(li);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = items[Math.min(items.length - 1, i + 1)] as HTMLElement;
        state.selectedKey = next.getAttribute('data-key');
        render();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = items[Math.max(0, i - 1)] as HTMLElement;
        state.selectedKey = prev.getAttribute('data-key');
        render();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.selectedKey = li.getAttribute('data-key');
        render();
      }
    });
  });

  app.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') || '';
      const label = btn.getAttribute('data-label') || 'value';
      if (text) void copyText(text, label);
    });
  });

  document.getElementById('btn-copy-donate')?.addEventListener('click', () => {
    void copyText(LAB_BRANDING.donationAddressAda, 'donation address');
  });
  document.getElementById('dock-copy-addr')?.addEventListener('click', () => {
    void copyText(LAB_BRANDING.donationAddressAda, 'donation address');
  });
}

refreshDiscovery();
refreshMatrix();
if (state.demoMode) {
  setJourney('idle', `Demo mode armed — ${DEMO_MODE_LABEL}`);
}
startWatcher();
initStarfield();
render();
log(`Lace Connect Studio ready · kit ${KIT_VERSION}`);
