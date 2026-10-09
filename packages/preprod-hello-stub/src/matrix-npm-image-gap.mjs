/**
 * Classify the remaining support-matrix JSON gaps recorded on
 * midnight-docs#1494 after the tag/github/container checks:
 * missing npmPackage, indexer image tag 4.3.302, preview node tag vs
 * the system_version the issue says preview RPC reports.
 * Does not call GitHub, Docker Hub, an indexer, or a node.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1494
 * Official matrix: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1494';
export const DOCS_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

/** HTML matrix versions read 2026-10-09. Proof server on that page is 8.1.0. */
export const HTML_PINS = {
  compactToolchain: '0.31.1',
  compactLanguage: '0.23',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
  walletSdk: '1.2.0',
  preprodIndexer: '4.3.302',
  previewNode: '1.0.300',
  preprodNode: '1.0.400',
};

/**
 * Identities midnight-docs#1494 says a script should use. Not a live lookup.
 */
export const RECORDED_ON_1494 = {
  compactRuntimeNpm: '@midnight-ntwrk/compact-runtime',
  walletSdkNpm: '@midnight-ntwrk/wallet-sdk',
  walletSdkLatestTag: '1.1.0',
  indexerImage: 'midnightntwrk/indexer-standalone',
  indexerImageTagThatExists: '4.3.3',
  indexerImageTagInJson: '4.3.302',
  previewRpcSystemVersion: '1.0.400-c338b9ac',
  compactDevtoolsRepo: 'midnightntwrk/compact-devtools',
};

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function text(value) {
  return value == null ? '' : String(value);
}

/**
 * @param {{ component?: string, network?: string, github?: string, container?: string, tag?: string, containerTag?: string, npmPackage?: string }} row
 */
export function classifyNpmImageGap(row = {}) {
  const findings = [];
  const component = text(row.component);
  const network = text(row.network);
  const github = text(row.github);
  const container = text(row.container);
  const tag = text(row.tag);
  const containerTag = text(row.containerTag);
  const npmPackage = text(row.npmPackage);

  if (/compact runtime|compact js|wallet sdk|midnight\.js/i.test(component) && !npmPackage) {
    findings.push({
      field: 'npmPackage',
      code: 'missing-npm-package',
      detail: `${component || 'package row'} has no npmPackage; midnight-docs#1494 says scripts cannot map the row to an installed package`,
    });
  }

  if (/wallet sdk/i.test(component) && npmPackage && npmPackage !== RECORDED_ON_1494.walletSdkNpm) {
    findings.push({
      field: 'npmPackage',
      code: 'wallet-sdk-npm-name',
      detail: `npmPackage ${npmPackage} is not ${RECORDED_ON_1494.walletSdkNpm} recorded on midnight-docs#1494`,
    });
  }

  if (/indexer/i.test(component) && /4\.3\.302/.test(`${tag} ${containerTag} ${container}`)) {
    findings.push({
      field: 'container',
      code: 'indexer-image-tag-unresolved',
      detail: `midnight-docs#1494 records no ${RECORDED_ON_1494.indexerImage}:${RECORDED_ON_1494.indexerImageTagInJson} image; 4.3.3 is the tag it says exists`,
    });
  }

  if (/node/i.test(component) && /preview/i.test(network) && /1\.0\.300/.test(`${tag} ${containerTag}`)) {
    findings.push({
      field: 'tag',
      code: 'preview-node-vs-reported-rpc',
      detail: `preview row uses 1.0.300; midnight-docs#1494 says preview RPC reported system_version ${RECORDED_ON_1494.previewRpcSystemVersion}`,
    });
  }

  if (github === RECORDED_ON_1494.compactDevtoolsRepo) {
    findings.push({
      field: 'github',
      code: 'devtools-repo-not-public',
      detail: `${github} is the devtools repo midnight-docs#1494 says is not public`,
    });
  }

  return {
    ok: findings.length === 0,
    kind: findings.length === 0 ? 'no-extra-gap' : 'npm-or-image-gap',
    component: component || null,
    network: network || null,
    findings,
    htmlPins: HTML_PINS,
    upstream: UPSTREAM,
    docs: DOCS_MATRIX,
    claim: 'classification of pasted matrix fields — does not fix the public indexer or node',
    credit: CREDIT,
  };
}

export function checkRecordedNpmImageGaps() {
  const rows = [
    classifyNpmImageGap({
      component: 'Compact runtime',
      network: 'preprod',
      github: RECORDED_ON_1494.compactDevtoolsRepo,
      tag: '0.16.0',
    }),
    classifyNpmImageGap({
      component: 'Midnight Indexer',
      network: 'preprod',
      container: `${RECORDED_ON_1494.indexerImage}:${RECORDED_ON_1494.indexerImageTagInJson}`,
      tag: 'midnight-indexer-4.3.302',
    }),
    classifyNpmImageGap({
      component: 'Node (Midnight)',
      network: 'preview',
      tag: 'node-1.0.300',
      containerTag: 'node-1.0.300',
    }),
    classifyNpmImageGap({
      component: 'Wallet SDK',
      network: 'preprod',
      npmPackage: RECORDED_ON_1494.walletSdkNpm,
      tag: '1.2.0',
    }),
  ];
  const codes = rows.flatMap((row) => row.findings.map((finding) => finding.code));
  return {
    ok: codes.includes('missing-npm-package')
      && codes.includes('devtools-repo-not-public')
      && codes.includes('indexer-image-tag-unresolved')
      && codes.includes('preview-node-vs-reported-rpc')
      && rows[3].ok === true,
    codes,
    walletSdkLatestTagRecorded: RECORDED_ON_1494.walletSdkLatestTag,
    htmlPins: HTML_PINS,
    upstream: UPSTREAM,
    docs: DOCS_MATRIX,
    claim: 'lab classification only — public indexer and node are not changed',
    credit: CREDIT,
  };
}

export const matrixNpmImageGapCredit = CREDIT;
