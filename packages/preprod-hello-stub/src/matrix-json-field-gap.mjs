/**
 * Classify support-matrix JSON fields that a script cannot resolve.
 * Does not fetch GitHub, Docker Hub, the indexer, or a node.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1494
 * Official HTML matrix (versions to trust for this lab):
 *   https://docs.midnight.network/relnotes/support-matrix
 * JSON named by the issue:
 *   https://github.com/midnightntwrk/midnight-docs/blob/main/docs/relnotes/support-matrix.json
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1494';
export const DOCS_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';
export const JSON_PATH = 'docs/relnotes/support-matrix.json';

/** Pins from the official HTML matrix, read 2026-10-08. Not taken from the JSON tags. */
export const HTML_PINS = {
  compactToolchain: '0.31.1',
  compactLanguage: '0.23.0',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
  preprodNode: '1.0.400',
  mainnetNode: '1.0.400',
};

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function bareVersion(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * @param {{ component?: string, github?: string, container?: string, tag?: string, containerTag?: string, network?: string }} row
 */
export function classifyMatrixJsonRow(row = {}) {
  const findings = [];
  const component = String(row.component ?? '');
  const tag = typeof row.tag === 'string' ? row.tag : '';
  const containerTag = typeof row.containerTag === 'string' ? row.containerTag : '';
  const github = typeof row.github === 'string' ? row.github : '';
  const container = typeof row.container === 'string' ? row.container : '';

  if (tag && containerTag && bareVersion(tag) && bareVersion(containerTag) && bareVersion(tag) !== bareVersion(containerTag)) {
    findings.push({
      field: 'containerTag',
      code: 'tag-container-mismatch',
      detail: `tag ${tag} and containerTag ${containerTag} name different versions`,
    });
  }

  if (containerTag.startsWith('node-') && bareVersion(containerTag)) {
    findings.push({
      field: 'containerTag',
      code: 'node-prefix-on-image-tag',
      detail: `containerTag ${containerTag} uses a git-tag prefix; the published node image tag is the bare version`,
    });
  }

  if (/proof server/i.test(component) && tag.startsWith('ledger-')) {
    findings.push({
      field: 'tag',
      code: 'proof-server-tag-is-ledger',
      detail: `proof-server row tag ${tag} is a ledger tag; official install is midnightntwrk/proof-server:${HTML_PINS.proofServer}`,
    });
  }

  if (/wallet sdk/i.test(component) && tag.startsWith('@')) {
    findings.push({
      field: 'tag',
      code: 'npm-spec-in-git-tag',
      detail: `tag ${tag} is an npm spec, not a git tag in ${github || 'the github field'}`,
    });
  }

  if (/indexer/i.test(component) && tag.startsWith('midnight-indexer-')) {
    findings.push({
      field: 'tag',
      code: 'indexer-tag-shape',
      detail: `tag ${tag} is not the v-prefixed git tag shape issue #1494 says midnight-indexer uses`,
    });
  }

  return {
    ok: findings.length === 0,
    component,
    network: row.network ?? null,
    github: github || null,
    container: container || null,
    tag: tag || null,
    containerTag: containerTag || null,
    findings,
    upstream: UPSTREAM,
    docs: DOCS_MATRIX,
    claim: 'JSON field classification only — not a node, indexer, or matrix fix',
    credit: CREDIT,
  };
}

/**
 * Sample taken from midnight-docs support-matrix.json (blob 0078894976, read 2026-10-08).
 * Mainnet node containerTag still disagrees with the HTML matrix 1.0.400.
 */
export function checkRecordedMatrixJsonGaps() {
  const rows = [
    classifyMatrixJsonRow({
      component: 'Node (Midnight)',
      network: 'mainnet',
      github: 'midnightntwrk/midnight-node',
      container: 'docker.io/midnightntwrk/midnight-node',
      tag: 'node-1.0.400',
      containerTag: 'node-1.0.300',
    }),
    classifyMatrixJsonRow({
      component: 'Node (Midnight)',
      network: 'preprod',
      github: 'midnightntwrk/midnight-node',
      container: 'docker.io/midnightntwrk/midnight-node',
      tag: 'node-1.0.400',
      containerTag: 'node-1.0.400',
    }),
    classifyMatrixJsonRow({
      component: 'Proof server',
      network: 'preprod',
      github: 'midnightntwrk/midnight-ledger',
      container: 'docker.io/midnightntwrk/proof-server',
      tag: 'ledger-8.1.0',
      containerTag: '8.1.0',
    }),
    classifyMatrixJsonRow({
      component: 'Wallet SDK',
      network: 'preprod',
      github: 'midnightntwrk/midnight-wallet',
      tag: '@midnightntwrk/wallet-sdk@1.2.0',
    }),
    classifyMatrixJsonRow({
      component: 'Midnight Indexer',
      network: 'preprod',
      github: 'midnightntwrk/midnight-indexer',
      tag: 'midnight-indexer-4.3.302',
    }),
  ];
  const findings = rows.flatMap((row) => row.findings.map((finding) => `${row.network}:${row.component}:${finding.code}`));
  return {
    ok: findings.includes('mainnet:Node (Midnight):tag-container-mismatch')
      && findings.includes('preprod:Proof server:proof-server-tag-is-ledger')
      && findings.includes('preprod:Wallet SDK:npm-spec-in-git-tag'),
    findings,
    htmlPins: HTML_PINS,
    upstream: UPSTREAM,
    docs: DOCS_MATRIX,
    jsonPath: JSON_PATH,
    claim: 'classification of pasted JSON rows — does not publish a matrix or fix a public node',
    credit: CREDIT,
  };
}

export const matrixJsonFieldGapCredit = CREDIT;
