/**
 * Documented Lace / Midnight connector workarounds.
 * These are NOT fake APIs — they describe real failure modes and mitigations.
 *
 * Sources (public issues / docs):
 * - https://docs.midnight.network/sdks/community/wallets/community-wallets-integration
 * - https://docs.midnight.network/guides/react-wallet-connect
 * - https://github.com/midnightntwrk/midnight-dapp-connector-api
 * - https://github.com/input-output-hk/lace/issues/2243 (Wallet unavailable after connect)
 * - Lace 2.3 sync-reset notes: https://www.lace.io/blog/lace-2-3-small-refresh-big-changes
 */

export type Workaround = {
  id: string;
  title: string;
  symptom: string;
  mitigation: string;
  references: string[];
};

export const LACE_MIDNIGHT_WORKAROUNDS: readonly Workaround[] = [
  {
    id: 'enumerate-not-mnLace',
    title: 'Support friendly keys and the v4 rdns scan',
    symptom:
      'A hardcoded window.midnight.mnLace read is undefined, or a UUID-only scan misses Lace / 1AM.',
    mitigation:
      'Official integration supports both paths: fixed keys window.midnight.mnLace and window.midnight["1am"], plus v4 keys with a stable rdns. Scan Object.keys(window.midnight), keep entries whose connect is a function, filter apiVersion, and match rdns. Do not assume only UUIDs exist.',
    references: [
      'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration',
      'https://docs.midnight.network/guides/react-wallet-connect',
    ],
  },
  {
    id: 'lace-no-getProvingProvider',
    title: 'Lace does not expose getProvingProvider or signData',
    symptom:
      'Calling getProvingProvider() or signData() throws, or a DApp hard-codes Configuration.proverServerUri.',
    mitigation:
      'Feature-detect with typeof api.getProvingProvider === "function" (same for signData) and do not call when absent. Lace proves via the local proof server at http://localhost:6300 (Settings → Midnight → Local). 1AM implements getProvingProvider. LOCAL-TRUE until a proof is actually produced.',
    references: [
      'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration',
      'https://docs.midnight.network/getting-started/installation',
    ],
  },
  {
    id: 'wallet-unavailable-after-connect',
    title: 'Wallet unavailable after successful connect()',
    symptom:
      'connect("preprod") resolves, but getShieldedAddresses / getConfiguration / balances throw APIError: Wallet is unavailable. getConnectionStatus may still work.',
    mitigation:
      'Often tied to Preprod sync / OOM in Lace. Update Lace (2.3+), wait until fully Synced, restart the extension or browser, then reconnect. Reset Midnight account sync from Lace account settings if stuck. This kit surfaces KitErrorCodes.WalletUnavailable with a recoverable flag.',
    references: [
      'https://github.com/input-output-hk/lace/issues/2243',
      'https://www.lace.io/blog/lace-2-3-small-refresh-big-changes',
    ],
  },
  {
    id: 'dust-freeze-while-synced',
    title: 'DUST / fee UX while wallet shows Synced',
    symptom:
      'Wallet UI shows Synced but DUST appears frozen, fees fail, or spendable DUST does not match expectations.',
    mitigation:
      'Confirm you are on the intended network (preprod vs preview). Ensure tNIGHT → tDUST generation completed. Prefer Lace versions that calculate fees from spendable DUST. Reset sync if Dust sync events failed. Do not treat UI "Synced" as proof that connector-backed fee payment will succeed.',
    references: [
      'https://docs.midnight.network/guides/acquire-tokens',
      'https://www.lace.io/blog/lace-2-3-small-refresh-big-changes',
    ],
  },
  {
    id: 'makeTransfer-options',
    title: 'makeTransfer when options are omitted',
    symptom:
      'Unexpected fee behaviour or InvalidRequest when initiating transfers.',
    mitigation:
      'ConnectedAPI.makeTransfer(desiredOutputs, options?) — payFees defaults to true when options are omitted. Pass an explicit { payFees: true } or { payFees: false } when fee payment must be controlled. This kit does not call makeTransfer in the demo; do not claim mainnet transfers work from discovery/connect alone.',
    references: [
      'https://docs.midnight.network/api-reference/dapp-connector',
      'https://github.com/midnightntwrk/midnight-dapp-connector-api',
    ],
  },
  {
    id: 'version-matrix',
    title: 'Pin connector + midnight-js to the compatibility matrix',
    symptom:
      'Subtle runtime mismatches between Lace, dapp-connector-api, and midnight-js.',
    mitigation:
      'This lab targets DApp Connector 4.0.1 types and documents midnight-js 4.1.1 as a common matrix peer. Always re-check Midnight’s official compatibility matrix before deploying.',
    references: [
      'https://docs.midnight.network/',
      'https://www.npmjs.com/package/@midnight-ntwrk/dapp-connector-api',
    ],
  },
] as const;

export function formatWorkaroundsMarkdown(): string {
  return LACE_MIDNIGHT_WORKAROUNDS.map(
    (w) =>
      `### ${w.title}\n\n- **Symptom:** ${w.symptom}\n- **Mitigation:** ${w.mitigation}\n- **Refs:** ${w.references.join(' · ')}\n`,
  ).join('\n');
}
