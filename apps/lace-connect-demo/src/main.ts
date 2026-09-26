/**
 * Lace Midnight connect demo — discovery + connect only.
 * Does NOT perform or claim mainnet / Preprod transfers.
 */
import './style.css';
import {
  LAB_BRANDING,
  LACE_MIDNIGHT_WORKAROUNDS,
  MidnightNetworkIds,
  connectWithProvider,
  discoverProviders,
  normalizeConnectorError,
  probeStatusMatrix,
  safeIconUrl,
  safeWalletLabel,
  userHintForError,
  type ConnectedSession,
  type DiscoveredProvider,
  type StatusMatrix,
} from '@kshot/lace-midnight-kit';

const NETWORKS = [
  { id: MidnightNetworkIds.Preprod, label: 'preprod (test — default)' },
  { id: MidnightNetworkIds.Preview, label: 'preview (test)' },
  { id: MidnightNetworkIds.Undeployed, label: 'undeployed (local)' },
  { id: MidnightNetworkIds.Mainnet, label: 'mainnet (connect only — no transfer demo)' },
] as const;

type AppState = {
  providers: DiscoveredProvider[];
  selectedKey: string | null;
  networkId: string;
  session: ConnectedSession | null;
  matrix: StatusMatrix | null;
  log: string[];
};

const state: AppState = {
  providers: [],
  selectedKey: null,
  networkId: MidnightNetworkIds.Preprod,
  session: null,
  matrix: null,
  log: [],
};

function log(line: string): void {
  const stamp = new Date().toLocaleTimeString();
  state.log.unshift(`[${stamp}] ${line}`);
  if (state.log.length > 40) state.log.length = 40;
  const el = document.getElementById('log');
  if (el) el.textContent = state.log.join('\n');
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const hasLace = state.providers.length > 0;
  const connected = state.session !== null;

  app.innerHTML = `
    <div class="wrap">
      <header class="top">
        <a class="logo" href="https://github.com/Kshot3000/Midnight-GrokBot-Agent">Midnight<span>Lab</span></a>
        <span class="badge">DEMO · discovery + connect only</span>
      </header>

      <div class="banner" role="status">
        <strong>Network / safety:</strong> This page only discovers <code>window.midnight</code> providers
        and calls <code>connect(networkId)</code> to read status / addresses.
        It does <strong>not</strong> call <code>makeTransfer</code>, balance, or submit — so
        <strong>do not treat a successful connect as proof that mainnet (or any) transfers work</strong>.
        Prefer <strong>preprod / preview</strong>. Lace is <strong>browser-only</strong>.
      </div>

      <div class="hero-intro">
        <h1>Lace Midnight connect demo</h1>
        <p class="lede">
          Uses <code>@kshot/lace-midnight-kit</code> + official
          <code>@midnight-ntwrk/dapp-connector-api@4.0.1</code> types.
          Status matrix + wallet enumeration (UUID keys / rdns) — never hardcodes <code>window.midnight.mnLace</code>.
          By <a href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
          · <a href="${LAB_BRANDING.nightDreamUrl}" rel="noopener noreferrer">NightDream.io</a>.
        </p>
      </div>


      <section class="panel matrix-panel">
        <h2>0. Connect status matrix</h2>
        <p class="muted" style="margin-top:-0.35rem;margin-bottom:0.85rem">
          Live probe of <code>window.midnight</code> — enumeration vs legacy <code>mnLace</code>,
          API ^4.0.0 compatibility, and duplicate <code>rdns</code>. Read-only; refresh anytime.
        </p>
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

      <section class="panel">
        <h2>1. Discover providers</h2>
        <div class="row">
          <button type="button" id="btn-refresh">Refresh discovery</button>
          <span class="status-pill ${hasLace ? 'on' : 'off'}">
            ${hasLace ? `${state.providers.length} wallet(s) found` : 'No wallet on window.midnight'}
          </span>
        </div>
        ${
          hasLace
            ? `<ul class="wallet-list" id="wallet-list">${state.providers
                .map((p) => {
                  const icon = safeIconUrl(p.api);
                  const selected = p.injectionKey === state.selectedKey;
                  return `<li data-key="${escapeAttr(p.injectionKey)}" class="${selected ? 'selected' : ''}">
                    ${icon ? `<img alt="" src="${escapeAttr(icon)}" />` : '<span class="muted">◇</span>'}
                    <div>
                      <div><strong></strong><span class="wallet-name"></span></div>
                      <div class="muted mono">rdns: ${escapeHtml(p.api.rdns || '(none)')} · api ${escapeHtml(p.api.apiVersion)} · key ${escapeHtml(p.injectionKey.slice(0, 8))}…</div>
                    </div>
                  </li>`;
                })
                .join('')}</ul>`
            : `<p class="muted">
                Without Lace (or another Midnight wallet extension) installed and enabled,
                discovery returns an empty list — the page still loads. Install
                <a href="https://www.lace.io/" rel="noopener noreferrer">Lace</a>,
                enable Midnight, refresh this tab, then click Refresh discovery.
              </p>`
        }
      </section>

      <section class="panel">
        <h2>2. Connect (read-only demo)</h2>
        <div class="row">
          <label for="network">Network id</label>
          <select id="network">
            ${NETWORKS.map(
              (n) =>
                `<option value="${escapeAttr(n.id)}" ${n.id === state.networkId ? 'selected' : ''}>${escapeHtml(n.label)}</option>`,
            ).join('')}
          </select>
          <button type="button" id="btn-connect" ${hasLace ? '' : 'disabled'}>Connect</button>
          <button type="button" class="ghost" id="btn-disconnect" ${connected ? '' : 'disabled'}>Clear session</button>
        </div>
        <p class="muted">Default is <strong>preprod</strong> (test). Mainnet option is connect/status only — no transfers.</p>
        <div id="session-panel">${renderSession(state.session)}</div>
      </section>

      <section class="panel">
        <h2>Activity log</h2>
        <pre class="log" id="log">${escapeHtml(state.log.join('\n') || 'Ready.')}</pre>
      </section>

      <section class="panel">
        <h2>Documented Lace workarounds</h2>
        <ul class="hints">
          ${LACE_MIDNIGHT_WORKAROUNDS.map((w) => `<li><strong>${escapeHtml(w.title)}</strong> — ${escapeHtml(w.mitigation)}</li>`).join('')}
        </ul>
        <p class="muted" style="margin-top:0.75rem">
          Official:
          <a href="https://docs.midnight.network/guides/react-wallet-connect" rel="noopener noreferrer">React wallet connect</a>
          ·
          <a href="https://github.com/midnightntwrk/midnight-dapp-connector-api" rel="noopener noreferrer">dapp-connector-api</a>
        </p>
      </section>

      <footer class="site-footer">
        <div>
          <strong>Midnight GrokBot Agent</strong>
          · MIT · by <a href="${LAB_BRANDING.xUrl}" rel="noopener noreferrer">${LAB_BRANDING.xHandle}</a>
          · <a href="${LAB_BRANDING.nightDreamUrl}" rel="noopener noreferrer">NightDream.io</a>
          · <a href="${LAB_BRANDING.repoUrl}" rel="noopener noreferrer">GitHub</a>
        </div>
        <div class="footer-donate">
          <span>Donate ADA:</span>
          <code>${LAB_BRANDING.donationAddressAda}</code>
        </div>
        <p class="disclaimer">
          Not affiliated with the Midnight Foundation. This demo does not claim mainnet transfers.
          Verify versions against Midnight’s compatibility matrix before production use.
        </p>
      </footer>
    </div>
  `;

  // Fill matrix provider names via text nodes (XSS-safe)
  app.querySelectorAll('.mx-pname').forEach((el) => {
    const key = el.getAttribute('data-key');
    const provider = state.matrix?.providers.find((p) => p.injectionKey === key);
    if (provider) el.textContent = provider.name;
  });

  // Fill wallet names via text nodes (XSS-safe)
  app.querySelectorAll('.wallet-list li').forEach((li) => {
    const key = li.getAttribute('data-key');
    const provider = state.providers.find((p) => p.injectionKey === key);
    const nameEl = li.querySelector('.wallet-name');
    if (nameEl && provider) {
      nameEl.textContent = safeWalletLabel(provider.api);
    }
    li.addEventListener('click', () => {
      state.selectedKey = key;
      render();
      log(`Selected provider key=${key?.slice(0, 8)}…`);
    });
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

  document.getElementById('network')?.addEventListener('change', (e) => {
    state.networkId = (e.target as HTMLSelectElement).value;
  });

  document.getElementById('btn-connect')?.addEventListener('click', () => {
    void handleConnect();
  });

  document.getElementById('btn-disconnect')?.addEventListener('click', () => {
    state.session = null;
    log('Cleared local session (connector has no global disconnect).');
    render();
  });
}

function renderSession(session: ConnectedSession | null): string {
  if (!session) {
    return `<p class="muted">Not connected.</p>`;
  }
  const st = session.status;
  const statusText =
    st.status === 'connected'
      ? `connected · networkId=${st.networkId}`
      : 'disconnected';
  return `
    <div class="kv" style="margin-top:0.5rem">
      <div><span class="k">Status</span><span class="v ok">${escapeHtml(statusText)}</span></div>
      <div><span class="k">Requested</span><span class="v">${escapeHtml(session.networkId)}</span></div>
      <div><span class="k">Wallet</span><span class="v">${escapeHtml(safeWalletLabel(session.provider.api))} (${escapeHtml(session.provider.api.rdns)})</span></div>
      <div><span class="k">Unshielded</span><span class="v">${escapeHtml(session.addresses.unshieldedAddress ?? '(unavailable)')}</span></div>
      <div><span class="k">Shielded</span><span class="v">${escapeHtml(session.addresses.shieldedAddress ?? '(unavailable / not requested)')}</span></div>
      <div><span class="k">Dust addr</span><span class="v">${escapeHtml(session.addresses.dustAddress ?? '(unavailable)')}</span></div>
      <div><span class="k">Indexer</span><span class="v">${escapeHtml(session.configuration?.indexerUri ?? '(config unavailable)')}</span></div>
    </div>
  `;
}


function statusClass(s: string): string {
  if (s === 'ok') return 'mx-ok';
  if (s === 'warn') return 'mx-warn';
  if (s === 'bad') return 'mx-bad';
  if (s === 'info') return 'mx-info';
  return 'mx-unknown';
}

function renderMatrix(matrix: StatusMatrix | null): string {
  if (!matrix) {
    return `<p class="muted">Click <strong>Refresh matrix</strong> after Lace injects (or to confirm an empty probe).</p>`;
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
              <div><strong></strong><span class="mx-pname" data-key="${escapeAttr(p.injectionKey)}"></span>
                ${p.isLegacyMnLaceKey ? '<span class="mx-pill mx-info">mnLace key</span>' : ''}
                ${p.compatibleV4 ? '<span class="mx-pill mx-ok">^4</span>' : '<span class="mx-pill mx-warn">not ^4</span>'}
              </div>
              <div class="muted mono">rdns=${escapeHtml(p.rdns || '(none)')} · api=${escapeHtml(p.apiVersion || '?')} · key=${escapeHtml(p.injectionKey.slice(0, 10))}…</div>
              <div class="muted">connect=${p.hasConnect ? 'yes' : 'no'} · enable(legacy)=${p.hasEnable ? 'yes' : 'no'}</div>
            </div>`,
          )
          .join('')}</div>`;
  return `
    <div class="mx-table-wrap">
      <table class="mx-table">
        <thead><tr><th>Status</th><th>Check</th><th>Detail</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${providers}
  `;
}

function refreshMatrix(): void {
  try {
    state.matrix = probeStatusMatrix({ apiVersionRange: '^4.0.0' });
    log(
      `Matrix: midnight=${state.matrix.hasMidnightObject} keys=${state.matrix.injectionKeyCount} providers=${state.matrix.providers.length} v4=${state.matrix.compatibleV4Count} mnLace=${state.matrix.legacyMnLacePresent}`,
    );
  } catch (err) {
    const e = normalizeConnectorError(err);
    log(`Matrix error: ${e.code} — ${userHintForError(e)}`);
  }
}

function refreshDiscovery(): void {
  try {
    const result = discoverProviders({ apiVersionRange: '^4.0.0' });
    // If nothing matches ^4, still show all so the user sees Lace is present
    state.providers =
      result.compatible.length > 0 ? result.compatible : result.providers;
    if (state.providers.length && !state.selectedKey) {
      state.selectedKey = state.providers[0]!.injectionKey;
    }
    if (result.hasDuplicateRdns) {
      log('Warning: duplicate rdns among providers — choose carefully.');
    }
    log(
      state.providers.length
        ? `Discovered ${state.providers.length} provider(s). Keys: ${result.injectionKeys.map((k) => k.slice(0, 8)).join(', ')}…`
        : 'No providers on window.midnight (Lace not injected in this browser context).',
    );
  } catch (err) {
    const e = normalizeConnectorError(err);
    log(`Discovery error: ${e.code} — ${userHintForError(e)}`);
  }
}

async function handleConnect(): Promise<void> {
  const provider = state.providers.find((p) => p.injectionKey === state.selectedKey);
  if (!provider) {
    log('Select a wallet first.');
    return;
  }
  log(`Connecting to ${safeWalletLabel(provider.api)} on networkId=${state.networkId}…`);
  render();
  try {
    const session = await connectWithProvider(provider, {
      networkId: state.networkId,
      assertNetworkMatch: true,
      hintUsage: [
        'getConnectionStatus',
        'getUnshieldedAddress',
        'getConfiguration',
      ],
    });
    state.session = session;
    log(
      `Connected. status=${session.status.status} network=${session.networkId} unshielded=${session.addresses.unshieldedAddress ?? 'n/a'}`,
    );
  } catch (err) {
    const e = normalizeConnectorError(err);
    log(`Connect failed: [${e.code}] ${e.message}`);
    log(`Hint: ${userHintForError(e)}`);
    state.session = null;
  }
  render();
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

refreshDiscovery();
refreshMatrix();
render();
