/**
 * Browser DApp lifecycle check. Does not open a wallet or a network.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1379
 * Official: https://docs.midnight.network/api-reference/dapp-connector
 * Official: https://docs.midnight.network/guides/deploy-and-operate
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_BROWSER_LIFECYCLE =
  'https://github.com/midnightntwrk/midnight-docs/issues/1379';
export const OFFICIAL_CONNECTOR =
  'https://docs.midnight.network/api-reference/dapp-connector';
export const OFFICIAL_DEPLOY =
  'https://docs.midnight.network/guides/deploy-and-operate';

export const CONNECTOR_API = '4.0.1';
export const MIDNIGHT_JS = '4.1.1';
export const LOCAL_PROOF_SERVER = 'http://localhost:6300';
export const NETWORK_IDS = ['preprod', 'preview', 'mainnet', 'undeployed'];

export const REQUIRED_PROVIDER_SLOTS = [
  'privateStateProvider',
  'publicDataProvider',
  'zkConfigProvider',
  'proofProvider',
  'walletProvider',
  'midnightProvider',
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {{
 *   apiVersion?: string,
 *   networkId?: string,
 *   connected?: boolean,
 *   connectionNetworkId?: string,
 *   setNetworkIdBeforeProviders?: boolean,
 *   providerSlots?: string[],
 *   hasGetProvingProvider?: boolean,
 *   proofServerUrl?: string,
 *   usesOnlyDeprecatedProverServerUri?: boolean,
 * }} plan
 */
export function checkBrowserLifecycle(plan = {}) {
  const failures = [];
  const networkId = plan.networkId;
  if (!NETWORK_IDS.includes(networkId)) {
    failures.push(
      'connect(networkId) must use preprod, preview, mainnet, or undeployed',
    );
  }
  if (!plan.connected) {
    failures.push('call InitialAPI.connect(networkId) before providers or submitTransaction');
  }
  if (plan.connected && plan.connectionNetworkId !== networkId) {
    failures.push('getConnectionStatus().networkId must match the requested networkId');
  }
  if (plan.apiVersion && !String(plan.apiVersion).startsWith('4.')) {
    failures.push(
      `lab pin is DApp Connector ${CONNECTOR_API}; the published sample filters apiVersion ^1.0, which does not match 4.0.1`,
    );
  }
  if (!plan.setNetworkIdBeforeProviders) {
    failures.push('call setNetworkId before constructing MidnightProviders');
  }
  const slots = new Set(plan.providerSlots || []);
  for (const slot of REQUIRED_PROVIDER_SLOTS) {
    if (!slots.has(slot)) failures.push(`missing MidnightProviders slot ${slot}`);
  }
  if (plan.usesOnlyDeprecatedProverServerUri) {
    failures.push(
      'Configuration.proverServerUri is deprecated; feature-detect getProvingProvider, else use the local proof server',
    );
  }
  if (!plan.hasGetProvingProvider) {
    const url = plan.proofServerUrl || '';
    if (url !== LOCAL_PROOF_SERVER) {
      failures.push(
        `Lace has no getProvingProvider; fall back to ${LOCAL_PROOF_SERVER} (proof-server 8.1.0)`,
      );
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    connector: CONNECTOR_API,
    midnightJs: MIDNIGHT_JS,
    upstream: UPSTREAM_BROWSER_LIFECYCLE,
    official: OFFICIAL_CONNECTOR,
    credit: CREDIT,
  };
}
