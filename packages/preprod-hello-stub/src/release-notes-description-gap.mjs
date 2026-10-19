/**
 * Classify a release-notes page against the shared-description groups in
 * midnight-docs#1561. Does not call a docs site, indexer, or node.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1561
 * Support matrix: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_SHARED_DESCRIPTION =
  'https://github.com/midnightntwrk/midnight-docs/issues/1561';
export const OFFICIAL_SUPPORT_MATRIX =
  'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_RELNOTES = 'https://docs.midnight.network/relnotes/';

/** Groups reported by midnight-docs#1561. Versions are the ones listed there. */
export const SHARED_DESCRIPTION_GROUPS = Object.freeze({
  node: {
    boilerplate: 'Node is a core component of the Midnight Network...',
    versions: ['0.18.0', '1.0.400'],
    pageCount: 11,
  },
  'midnight-js': {
    boilerplate: 'shared across 3.0.0 to 4.0.4',
    versions: ['3.0.0', '4.0.4'],
    pageCount: 6,
  },
  ledger: {
    boilerplate: 'shared across 7.0.0-8.0.3 and 8.1.0-8.1.3',
    versions: ['7.0.0', '8.0.3', '8.1.0', '8.1.3'],
    pageCount: 7,
  },
  'compact-developer-tools': {
    boilerplate: 'shared across 0.5.0 to 0.5.3',
    versions: ['0.5.0', '0.5.3'],
    pageCount: 4,
  },
  'compact-js': {
    boilerplate: 'shared across 2.4.0, 2.5.0, 2.5.3',
    versions: ['2.4.0', '2.5.0', '2.5.3'],
    pageCount: 3,
  },
  'dapp-connector': {
    boilerplate: 'shared across 4.0.0, 4.0.1',
    versions: ['4.0.0', '4.0.1'],
    pageCount: 2,
  },
  wallet: {
    boilerplate: 'shared wallet-1-0-0 and wallet-sdk-1-0-0',
    versions: ['1.0.0'],
    pageCount: 2,
  },
  examples: {
    boilerplate: 'Example contract',
    versions: ['battleship-simple', 'private-guest-list', 'private-reserve-auction'],
    pageCount: 3,
  },
});

/** Lab pins. Description sharing does not change these. */
export const LAB_PINS = Object.freeze({
  compact: '~0.31.1',
  language: '~0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
});

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} component
 * @param {string} [version]
 * @returns {{shared: boolean, component: string, version?: string, group?: object, advice: string, upstream: string, matrix: string, credit: string}}
 */
export function classifyReleaseNotesDescription(component, version) {
  const key = String(component || '').toLowerCase().replace(/\s+/g, '-');
  const group = SHARED_DESCRIPTION_GROUPS[key] || null;
  const shared = Boolean(group);
  const advice = shared
    ? 'Description is the component boilerplate reported by midnight-docs#1561. Open the support matrix, then the concrete release-notes page for your pin. Do not use the search snippet or llms.txt description to tell versions apart.'
    : 'Not in the shared-description groups listed by midnight-docs#1561. Still re-check the support matrix for the pin you deploy.';
  return {
    shared,
    component: key,
    version: version || undefined,
    group: group || undefined,
    advice,
    upstream: UPSTREAM_SHARED_DESCRIPTION,
    matrix: OFFICIAL_SUPPORT_MATRIX,
    labPins: LAB_PINS,
    credit: CREDIT,
  };
}
