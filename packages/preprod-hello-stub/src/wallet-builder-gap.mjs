/**
 * Pointer for the wallet-builder guide gap.
 * Does not inject window.midnight, does not call a wallet, does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1554
 * Official: https://docs.midnight.network/sdks/official/wallet-developer-guide
 * Official: https://docs.midnight.network/api-reference/dapp-connector
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_WALLET_BUILDER =
  'https://github.com/midnightntwrk/midnight-docs/issues/1554';
export const OFFICIAL_WALLET_GUIDE =
  'https://docs.midnight.network/sdks/official/wallet-developer-guide';
export const OFFICIAL_CONNECTOR =
  'https://docs.midnight.network/api-reference/dapp-connector';
export const OFFICIAL_INITIAL_API =
  'https://docs.midnight.network/api-reference/dapp-connector/type-aliases/InitialAPI';
export const PUBLIC_SPEC =
  'https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md';

export const CONNECTOR_API = '4.0.1';
export const DOCUMENTED_INITIAL_API_FIELDS = [
  'rdns',
  'name',
  'icon',
  'apiVersion',
  'connect',
];

/**
 * Returns true only when the caller passed the exact documented field list.
 * No network, no DOM.
 */
export function matchesDocumentedInitialApiShape(fields) {
  if (!Array.isArray(fields) || fields.length !== DOCUMENTED_INITIAL_API_FIELDS.length) {
    return false;
  }
  return DOCUMENTED_INITIAL_API_FIELDS.every((f, i) => fields[i] === f);
}
