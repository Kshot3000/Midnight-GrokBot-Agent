/**
 * Wallet-builder InitialAPI field check.
 * Does not open a wallet, a network, or a proof server.
 * Does not invent connector methods.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1554
 * Official: https://docs.midnight.network/api-reference/dapp-connector
 * Spec: https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_WALLET_BUILDER =
  'https://github.com/midnightntwrk/midnight-docs/issues/1554';
export const OFFICIAL_CONNECTOR =
  'https://docs.midnight.network/api-reference/dapp-connector';
export const CONNECTOR_SPEC =
  'https://github.com/midnightntwrk/midnight-dapp-connector-api/blob/main/SPECIFICATION.md';

export const CONNECTOR_API = '4.0.1';

/** Fields the published connector page names on the Initial API. */
export const PUBLISHED_INITIAL_FIELDS = Object.freeze([
  'name',
  'icon',
  'apiVersion',
  'connect',
]);

/** Additional field the connector specification requires for CAIP-372. */
export const SPEC_INITIAL_FIELDS = Object.freeze(['rdns']);

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {{
 *   fields?: string[],
 *   apiVersion?: string,
 *   installsUnderWindowMidnight?: boolean,
 *   keyIsUuid?: boolean,
 * }} plan
 */
export function checkWalletBuilderInitialApi(plan = {}) {
  const failures = [];
  const fields = new Set(plan.fields || []);
  for (const field of PUBLISHED_INITIAL_FIELDS) {
    if (!fields.has(field)) {
      failures.push(
        `Initial API missing published field ${field} (docs.midnight.network/api-reference/dapp-connector)`,
      );
    }
  }
  for (const field of SPEC_INITIAL_FIELDS) {
    if (!fields.has(field)) {
      failures.push(
        `Initial API missing specification field ${field} (CAIP-372 rdns on the connector SPECIFICATION.md)`,
      );
    }
  }
  if (!plan.installsUnderWindowMidnight) {
    failures.push('wallet must install its InitialAPI under window.midnight keyed by a UUID');
  }
  if (plan.installsUnderWindowMidnight && plan.keyIsUuid === false) {
    failures.push('specification requires the window.midnight key to be a freshly generated UUIDv4');
  }
  if (plan.apiVersion && plan.apiVersion !== CONNECTOR_API) {
    failures.push(
      `lab pin is DApp Connector ${CONNECTOR_API}; apiVersion should report the package version the wallet implemented`,
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    connector: CONNECTOR_API,
    publishedFields: [...PUBLISHED_INITIAL_FIELDS],
    specFields: [...SPEC_INITIAL_FIELDS],
    upstream: UPSTREAM_WALLET_BUILDER,
    official: OFFICIAL_CONNECTOR,
    spec: CONNECTOR_SPEC,
    credit: CREDIT,
  };
}

export const walletBuilderCredit = CREDIT;
