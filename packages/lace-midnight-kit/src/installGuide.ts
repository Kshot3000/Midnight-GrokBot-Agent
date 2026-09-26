/**
 * Structured Lace + Midnight install guide for Connect Studio empty states.
 * Honest: install ≠ connected ≠ funded ≠ transferable.
 */

export type InstallGuideStep = {
  id: string;
  title: string;
  detail: string;
  href?: string;
};

export type InstallGuide = {
  title: string;
  subtitle: string;
  steps: readonly InstallGuideStep[];
  afterInstall: readonly string[];
  notClaimed: readonly string[];
};

/** Canonical install path used by Lace Connect Studio. */
export const LACE_INSTALL_GUIDE: InstallGuide = {
  title: 'Install Lace for Midnight',
  subtitle:
    'This studio enumerates window.midnight. No providers means Lace is missing, disabled, or not injected yet — we will not fake a connected wallet.',
  steps: [
    {
      id: 'install',
      title: 'Install Lace',
      detail:
        'Use lace.io or the Chrome Web Store build. Firefox users: confirm Midnight support for your Lace build before relying on injection.',
      href: 'https://www.lace.io/',
    },
    {
      id: 'enable-midnight',
      title: 'Enable Midnight',
      detail:
        'In Lace, turn on Midnight and wait until the Midnight account shows Synced (not syncing / not error).',
    },
    {
      id: 'network',
      title: 'Pick Preprod for lab work',
      detail:
        'Select Midnight Preprod (or Preview) for test work. Mainnet connect is status-only in this studio — no transfers.',
    },
    {
      id: 'refresh',
      title: 'Refresh this tab',
      detail:
        'Extensions often inject after first paint. Use Watch injection or click Refresh discovery after Lace is ready.',
    },
    {
      id: 'connect',
      title: 'Connect',
      detail:
        'Click Refresh discovery, select the wallet card, choose preprod, then Connect with Lace. Approve the prompt in the extension.',
    },
  ],
  afterInstall: [
    'Fund Preprod with faucet tNIGHT (browser captcha) then register / generate tDUST before any fee-paying tx.',
    'If connect returns WalletUnavailable, wait for full sync, update Lace 2.3+, restart the extension, see WORKAROUNDS.md.',
    'Demo mode explores UI chrome only — labeled SIMULATED, never a real session.',
  ],
  notClaimed: [
    'makeTransfer / submit',
    'On-chain Preprod deploy from this studio',
    'Live GitHub Pages until Actions workflow scope is enabled',
  ],
};

export function formatInstallGuideMarkdown(guide: InstallGuide = LACE_INSTALL_GUIDE): string {
  const lines = [
    `# ${guide.title}`,
    '',
    guide.subtitle,
    '',
    ...guide.steps.map(
      (s, i) =>
        `${i + 1}. **${s.title}** — ${s.detail}${s.href ? ` ([link](${s.href}))` : ''}`,
    ),
    '',
    '## After install',
    ...guide.afterInstall.map((t) => `- ${t}`),
    '',
    '## Not claimed',
    ...guide.notClaimed.map((t) => `- ${t}`),
  ];
  return lines.join('\n');
}
