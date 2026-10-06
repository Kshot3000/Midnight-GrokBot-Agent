/**
 * Classify support-matrix rows whose tag/github/container fields do not
 * resolve the way a script expects. Does not call GitHub and does not
 * invent Midnight APIs.
 *
 * Published matrix versions: https://docs.midnight.network/relnotes/support-matrix
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1494
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const builderCredit = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1494';
export const DOCS = 'https://docs.midnight.network/relnotes/support-matrix';

/** Versions printed on the compatibility matrix page (not the JSON tag field). */
export const DOCUMENTED_VERSIONS = {
  compactToolchain: '0.31.1',
  compactRuntime: '0.16.0',
  compactJs: '2.5.1',
  onchainRuntime: '3.0.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  walletSdk: '1.2.0',
  proofServer: '8.1.0',
  indexerPreview: '4.3.5',
  nodePreview: '1.0.300',
};

/**
 * Release identities recorded on midnight-docs#1494. Used only to explain
 * why a copied `tag` / `github` / `container` field will not check out.
 */
export const RECORDED_RELEASE_IDS = {
  compactToolchain: {
    version: '0.31.1',
    github: 'LFDT-Minokawa/compact',
    tag: 'compactc-v0.31.1',
  },
  midnightJs: {
    version: '4.1.1',
    github: 'midnightntwrk/midnight-js',
    tag: 'v4.1.1',
    npmPackage: '@midnight-ntwrk/midnight-js',
  },
  proofServer: {
    version: '8.1.0',
    github: 'midnightntwrk/midnight-ledger',
    tagShape: 'proof-server-<version>',
    container: 'midnightntwrk/proof-server',
  },
  node: {
    container: 'midnightntwrk/midnight-node',
  },
  walletSdk: {
    github: 'midnightntwrk/midnight-wallet',
    npmPackage: '@midnight-ntwrk/wallet-sdk',
  },
};

const COMPONENT_KEYS = {
  'compact toolchain': 'compactToolchain',
  'compact compiler': 'compactToolchain',
  compact: 'compactToolchain',
  'midnight.js': 'midnightJs',
  'midnight-js': 'midnightJs',
  'proof server': 'proofServer',
  'proof-server': 'proofServer',
  node: 'node',
  'midnight node': 'node',
  'wallet sdk': 'walletSdk',
};

function componentKey(component) {
  const name = String(component || '').trim().toLowerCase();
  return COMPONENT_KEYS[name] || null;
}

function text(value) {
  return value == null ? '' : String(value);
}

/**
 * @param {object} row
 * @param {string} row.component
 * @param {string} [row.tag]
 * @param {string} [row.github]
 * @param {string} [row.container]
 * @param {string} [row.containerTag]
 */
export function classifyMatrixRow(row) {
  const findings = [];
  const key = componentKey(row && row.component);
  const tag = text(row && row.tag);
  const github = text(row && row.github);
  const container = text(row && row.container);
  const containerTag = text(row && row.containerTag);

  if (!key) {
    return {
      ok: true,
      kind: 'unclassified',
      findings,
      upstream: UPSTREAM,
      docs: DOCS,
    };
  }

  if (key === 'compactToolchain') {
    const recorded = RECORDED_RELEASE_IDS.compactToolchain;
    if (tag && tag !== recorded.tag) {
      findings.push(
        `tag ${tag} is not the Compact release tag recorded on midnight-docs#1494 (${recorded.tag} in ${recorded.github})`,
      );
    }
    if (github && github !== recorded.github) {
      findings.push(
        `github ${github} is not the Compact repo recorded on midnight-docs#1494 (${recorded.github})`,
      );
    }
  }

  if (key === 'midnightJs') {
    const recorded = RECORDED_RELEASE_IDS.midnightJs;
    if (tag && tag !== recorded.tag && tag !== recorded.version) {
      findings.push(
        `tag ${tag} is not the midnight-js tag recorded on midnight-docs#1494 (${recorded.tag})`,
      );
    }
    if (tag === recorded.version) {
      findings.push(
        `tag ${tag} is the matrix version, not the git tag ${recorded.tag} recorded on midnight-docs#1494`,
      );
    }
  }

  if (key === 'proofServer') {
    const recorded = RECORDED_RELEASE_IDS.proofServer;
    if (github && github !== recorded.github) {
      findings.push(
        `github ${github} does not match the proof-server release repo recorded on midnight-docs#1494 (${recorded.github})`,
      );
    }
    if (container && !container.endsWith('proof-server')) {
      findings.push(
        `container ${container} is not the proof-server image recorded on midnight-docs#1494 (${recorded.container})`,
      );
    }
    if (tag && !tag.startsWith('proof-server-') && tag !== recorded.version) {
      findings.push(
        `tag ${tag} is neither the documented version ${recorded.version} nor a proof-server-* tag`,
      );
    }
  }

  if (key === 'node') {
    const recorded = RECORDED_RELEASE_IDS.node;
    if (container && container.includes('midnight-node-toolkit')) {
      findings.push(
        `container ${container} is the toolkit image; midnight-docs#1494 records the node image as ${recorded.container}`,
      );
    }
    if (tag && containerTag && tag !== containerTag) {
      findings.push(
        `tag ${tag} and containerTag ${containerTag} differ; midnight-docs#1494 records this split on the node row`,
      );
    }
  }

  if (key === 'walletSdk') {
    const recorded = RECORDED_RELEASE_IDS.walletSdk;
    if (github && github.includes('midnight-js')) {
      findings.push(
        `github ${github} is midnight-js; midnight-docs#1494 records the wallet SDK in ${recorded.github}`,
      );
    }
  }

  return {
    ok: findings.length === 0,
    kind: findings.length === 0 ? 'aligned' : 'unresolved-matrix-field',
    component: key,
    findings,
    documentedVersion: DOCUMENTED_VERSIONS[key] || null,
    upstream: UPSTREAM,
    docs: DOCS,
  };
}

export function labPinCheck() {
  return {
    compactToolchain: DOCUMENTED_VERSIONS.compactToolchain,
    language: '0.23',
    midnightJs: DOCUMENTED_VERSIONS.midnightJs,
    dappConnector: DOCUMENTED_VERSIONS.dappConnector,
    proofServer: DOCUMENTED_VERSIONS.proofServer,
    docs: DOCS,
    upstream: UPSTREAM,
  };
}
