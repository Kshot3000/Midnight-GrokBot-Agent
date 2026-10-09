/**
 * Classify the proof-server tag skew between the published matrix and the prove guide.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1494
 * Matrix page: https://docs.midnight.network/relnotes/support-matrix
 * Prove guide: https://docs.midnight.network/guides/local-proving
 *
 * The HTML matrix lists Proof server 8.1.3. The local-proving and installation
 * pages still start midnightntwrk/proof-server:8.1.0. Issue 1494 says the JSON
 * github field points at midnight-node, the container field points at
 * midnight-node-toolkit, and the tag proof-server-8.1.0 does not exist.
 * This classifier only labels strings the caller already has. It does not pull
 * images and does not claim a fix of the public indexer, node, or proof server.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_MATRIX_JSON =
  'https://github.com/midnightntwrk/midnight-docs/issues/1494';
export const OFFICIAL_SUPPORT_MATRIX =
  'https://docs.midnight.network/relnotes/support-matrix';
export const OFFICIAL_LOCAL_PROVING =
  'https://docs.midnight.network/guides/local-proving';

/** Tag written on the local-proving and installation pages. Lab pin. */
export const PROVE_GUIDE_IMAGE = 'midnightntwrk/proof-server:8.1.0';
/** Version column on the published Preview, Preprod, and Mainnet matrix tables. */
export const MATRIX_PAGE_PROOF_SERVER = '8.1.3';
/** Image named by the prove guide and by issue 1494. Not the toolkit image. */
export const DOCUMENTED_PROOF_IMAGE = 'midnightntwrk/proof-server';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} text
 */
export function classifyProofServerMatrixSkew(text) {
  const raw = String(text || '');
  const notes = [];
  const failures = [];

  const usesGuidePin = raw.includes(PROVE_GUIDE_IMAGE) || /proof-server:8\.1\.0\b/.test(raw);
  const usesMatrixPage = /8\.1\.3/.test(raw);
  const usesToolkit = /midnight-node-toolkit/i.test(raw);
  const githubPointsAtNode =
    /github\s*[:=]\s*midnightntwrk\/midnight-node/i.test(raw) ||
    /midnightntwrk\/midnight-node/.test(raw);
  const missingTag = /proof-server-8\.1\.0/.test(raw);

  if (usesGuidePin && usesMatrixPage) {
    notes.push(
      'skew: local-proving pins midnightntwrk/proof-server:8.1.0 while the published support-matrix page lists Proof server 8.1.3. Do not treat those as the same tag.',
    );
  } else if (usesMatrixPage && !usesGuidePin) {
    notes.push(
      'published matrix page lists Proof server 8.1.3. The local-proving page still starts midnightntwrk/proof-server:8.1.0. This lab pin follows the prove guide, not a guessed JSON tag.',
    );
  } else if (usesGuidePin) {
    notes.push(
      'matches the local-proving image midnightntwrk/proof-server:8.1.0. The HTML matrix version column is 8.1.3; midnight-docs#1494 says tag proof-server-8.1.0 does not resolve.',
    );
  }

  if (usesToolkit) {
    failures.push(
      'container midnight-node-toolkit is the field midnight-docs#1494 says does not resolve. The documented image is midnightntwrk/proof-server.',
    );
  }
  if (githubPointsAtNode && /proof-server/i.test(raw)) {
    failures.push(
      'midnight-docs#1494: proof-server github points at midnightntwrk/midnight-node, but the issue says the release is on midnight-ledger (proof-server-8.1.3). Do not clone midnight-node to get the prover.',
    );
  }
  if (missingTag) {
    notes.push(
      'tag proof-server-8.1.0 is the name midnight-docs#1494 says does not exist. The prove guide uses the image tag 8.1.0 on midnightntwrk/proof-server, which is not the same string as a git tag.',
    );
  }
  if (!usesGuidePin && !usesMatrixPage && !usesToolkit && !missingTag) {
    failures.push(
      'no proof-server image or version named. Expected midnightntwrk/proof-server:8.1.0 (prove guide) or the matrix page version 8.1.3.',
    );
  }

  return {
    ok: failures.length === 0,
    proveGuideImage: PROVE_GUIDE_IMAGE,
    matrixPageVersion: MATRIX_PAGE_PROOF_SERVER,
    documentedImage: DOCUMENTED_PROOF_IMAGE,
    usesGuidePin,
    usesMatrixPage,
    usesToolkit,
    notes,
    failures,
    upstream: UPSTREAM_MATRIX_JSON,
    officialMatrix: OFFICIAL_SUPPORT_MATRIX,
    officialProve: OFFICIAL_LOCAL_PROVING,
    credit: CREDIT,
  };
}
