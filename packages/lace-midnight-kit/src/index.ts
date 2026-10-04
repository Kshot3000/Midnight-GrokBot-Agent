/**
 * @kshot/lace-midnight-kit
 *
 * Browser helpers for Lace / Midnight DApp Connector discovery + connect.
 * Types from official `@midnight-ntwrk/dapp-connector-api` (pinned 4.0.1).
 *
 * Safety: does not implement or claim transfers / submit.
 * Scope = discover (friendly keys + v4 rdns), connect, prefs, reconnect,
 * refresh, capability + balance reads, proving/sign feature-detect.
 */

import '@midnight-ntwrk/dapp-connector-api';

export type {
  InitialAPI,
  ConnectedAPI,
  Configuration,
  ConnectionStatus,
  APIError,
  ErrorCode,
} from '@midnight-ntwrk/dapp-connector-api';
export { ErrorCodes } from '@midnight-ntwrk/dapp-connector-api';

export {
  MidnightNetworkIds,
  DEFAULT_DEMO_NETWORK,
  NETWORK_CATALOG,
  findNetworkCatalogEntry,
  describeNetworkSwitch,
  type MidnightNetworkId,
  type NetworkCatalogEntry,
  type NetworkSwitchPlan,
} from './networks.js';

export {
  FRIENDLY_INJECTION_KEYS,
  injectionKindForKey,
  discoverProviders,
  listCompatibleWallets,
  findProvider,
  safeWalletLabel,
  safeIconUrl,
  type InjectionKind,
  type DiscoveredProvider,
  type DiscoverOptions,
  type DiscoverResult,
} from './discover.js';

export {
  probeStatusMatrix,
  type MatrixRowStatus,
  type StatusMatrixRow,
  type ProviderMatrixEntry,
  type StatusMatrix,
} from './statusMatrix.js';

export {
  connectMidnightWallet,
  connectWithProvider,
  createDisconnectedSession,
  refreshSessionAddresses,
  type ConnectOptions,
  type ConnectWithProviderOptions,
  type ConnectedSession,
} from './connect.js';

export {
  LaceMidnightKitError,
  KitErrorCodes,
  ERROR_CATALOG,
  listErrorCatalog,
  findErrorCatalogEntry,
  recoveryActionsForError,
  isAPIError,
  isLaceMidnightKitError,
  normalizeConnectorError,
  userHintForError,
  type KitErrorCode,
  type ErrorCatalogEntry,
  type RecoveryAction,
  type RecoveryActionId,
} from './errors.js';

export {
  LACE_INSTALL_GUIDE,
  formatInstallGuideMarkdown,
  type InstallGuide,
  type InstallGuideStep,
} from './installGuide.js';

export {
  LACE_MIDNIGHT_WORKAROUNDS,
  formatWorkaroundsMarkdown,
  type Workaround,
} from './workarounds.js';

export { parseSemVer, semverSatisfies, type SemVer } from './semver.js';

export {
  formatAddress,
  formatInjectionKey,
  formatProbeTime,
} from './format.js';

export {
  watchMidnightInjection,
  type InjectionWatchSnapshot,
  type WatchInjectionOptions,
  type InjectionWatcher,
} from './watchInjection.js';

export {
  ConnectJourneyPhases,
  CONNECT_JOURNEY_STEPS,
  createConnectJourney,
  advanceConnectJourney,
  journeyStepIndex,
  type ConnectJourneyPhase,
  type ConnectJourneyStep,
  type ConnectJourneyState,
} from './connectJourney.js';

export {
  OPTIONAL_CONNECTOR_METHODS,
  featureDetectOptionalMethods,
  probeSessionCapabilities,
  type CapabilityStatus,
  type CapabilityProbeRow,
  type CapabilityProbe,
  type CapabilityProbeOptions,
} from './capabilities.js';

export {
  DEMO_MODE_LABEL,
  createDemoSession,
  createDemoCapabilityProbe,
  isDemoSession,
} from './demoMode.js';

export {
  LACE_PREF_KEYS,
  loadLacePreferences,
  saveNetworkPreference,
  savePreferredWalletRdns,
  saveDemoModePreference,
  clearLacePreferences,
  pickPreferredProvider,
  type LacePreferences,
} from './preferences.js';

export {
  checkSessionHealth,
  isSessionAlive,
  type SessionHealth,
} from './sessionHealth.js';

export {
  SESSION_PREFS_STORAGE_KEY,
  defaultSessionPrefs,
  loadSessionPrefs,
  saveSessionPrefs,
  clearSessionPrefs,
  snapshotFromSession,
  rememberSuccessfulConnect,
  setPreferredNetwork,
  setPreferredProvider,
  type SessionAddressSnapshot,
  type SessionPrefs,
} from './sessionPrefs.js';

export {
  resolvePreferredProvider,
  reconnectFromPrefs,
  type ReconnectOptions,
} from './reconnect.js';

export {
  readBalancesSafely,
  refreshConnectedSession,
  type BalanceSnapshot,
  type RefreshedSession,
} from './refreshSession.js';

export {
  watchConnectionStatus,
  type ConnectionHealthSnapshot,
  type WatchConnectionOptions,
  type ConnectionHealthWatcher,
} from './watchConnectionStatus.js';

/** Lab branding constants (canonical — also in BRANDING.md). */
export const LAB_BRANDING = {
  donationAddressAda:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  xHandle: '@kshot9000',
  xUrl: 'https://x.com/kshot9000',
  nightDreamUrl: 'https://nightdream.xyz',
  repoUrl: 'https://github.com/Kshot3000/Midnight-GrokBot-Agent',
  laceInstallUrl: 'https://www.lace.io/',
  laceChromeUrl:
    'https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk',
  officialConnectGuideUrl:
    'https://docs.midnight.network/sdks/community/wallets/community-wallets-integration',
} as const;

/** Kit semver for UI badges. */
export const KIT_VERSION = '0.3.3';
