/**
 * @kshot/lace-midnight-kit
 *
 * Browser helpers for Lace / Midnight DApp Connector discovery + connect.
 * Types come from official `@midnight-ntwrk/dapp-connector-api` (pinned 4.0.1).
 *
 * Safety: this package does not implement or claim mainnet transfers.
 * Demo scope = discover providers, connect, read address/network/status.
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
  type MidnightNetworkId,
} from './networks.js';

export {
  discoverProviders,
  listCompatibleWallets,
  findProvider,
  safeWalletLabel,
  safeIconUrl,
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
  type ConnectOptions,
  type ConnectWithProviderOptions,
  type ConnectedSession,
} from './connect.js';

export {
  LaceMidnightKitError,
  KitErrorCodes,
  isAPIError,
  isLaceMidnightKitError,
  normalizeConnectorError,
  userHintForError,
  type KitErrorCode,
} from './errors.js';

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
  probeSessionCapabilities,
  type CapabilityStatus,
  type CapabilityProbeRow,
  type CapabilityProbe,
} from './capabilities.js';

export {
  DEMO_MODE_LABEL,
  createDemoSession,
  createDemoCapabilityProbe,
  isDemoSession,
} from './demoMode.js';

/** Lab branding constants (canonical — also in BRANDING.md). */
export const LAB_BRANDING = {
  donationAddressAda:
    'addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  xHandle: '@kshot9000',
  xUrl: 'https://x.com/kshot9000',
  nightDreamUrl: 'https://nightdream.io',
  repoUrl: 'https://github.com/Kshot3000/Midnight-GrokBot-Agent',
} as const;

/** Kit semver for UI badges. */
export const KIT_VERSION = '0.2.0';
