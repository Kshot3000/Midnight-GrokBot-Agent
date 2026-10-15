/**
 * Decode node custom error 170 (InvalidDustSpendProof) and warn on proof-server version drift.
 * Does not call a proof server, wallet, indexer, or node. Does not fix the public indexer or node.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/252
 * Official: https://docs.midnight.network/nodes/error-codes
 *          https://docs.midnight.network/guides/dust-sponsorship
 *          https://docs.midnight.network/relnotes/support-matrix
 * Lab pin: proof-server 8.1.0 (matrix lists 8.1.3; public networks stay on 8.1.x)
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/252';
export const OFFICIAL_ERROR_CODES = 'https://docs.midnight.network/nodes/error-codes';
export const OFFICIAL_DUST = 'https://docs.midnight.network/guides/dust-sponsorship';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

export const LAB_PROOF_SERVER = '8.1.0';
export const MATRIX_PROOF_SERVER = '8.1.3';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const CUSTOM_170 = /Custom error:\s*170|InvalidDustSpendProof|error:\s*170/i;

/**
 * Classify a submission error string.
 * @param {unknown} error
 * @param {{ proofServerVersion?: string }} [opts]
 */
export function decodeDust170(error, opts = {}) {
  const text = error == null ? '' : typeof error === 'string' ? error : String(error.message || error);
  const hit = CUSTOM_170.test(text);
  const version = String(opts.proofServerVersion || LAB_PROOF_SERVER);
  const major = Number(version.split('.')[0]);
  const onPublicLine = major === 8;

  if (!hit) {
    return {
      kind: 'other',
      ok: true,
      is170: false,
      proofServerVersion: version,
      hint: 'no custom error 170 / InvalidDustSpendProof',
      upstream: UPSTREAM,
      official: OFFICIAL_ERROR_CODES,
      credit: CREDIT,
    };
  }

  const versionHint = onPublicLine
    ? `proof-server ${version} is on the public-network 8.1.x line (lab pins ${LAB_PROOF_SERVER}; matrix lists ${MATRIX_PROOF_SERVER}). 170 is most often unsynced DUST state — wait for full sync, rebuild, prove, resubmit.`
    : `proof-server ${version} is not the 8.1.x public-network line. servicedesk#252 reports 9.0.0-rc.9 DUST-spend proofs rejected as 170 on Stagenet. Stay on 8.1.x for Preprod/Mainnet.`;

  return {
    kind: 'invalid-dust-spend-proof',
    ok: false,
    is170: true,
    code: 170,
    name: 'InvalidDustSpendProof',
    proofServerVersion: version,
    onPublicLine,
    hint: versionHint,
    upstream: UPSTREAM,
    official: OFFICIAL_DUST,
    matrix: OFFICIAL_MATRIX,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = 'submitAndWatchExtrinsic(...): 1010: Invalid Transaction: Custom error: 170';
  const bad = decodeDust170(sample, { proofServerVersion: '9.0.0-rc.9' });
  const good = decodeDust170(sample, { proofServerVersion: '8.1.0' });
  const other = decodeDust170('something else');
  const ok =
    bad.is170 && !bad.onPublicLine && good.is170 && good.onPublicLine && !other.is170;
  if (!ok) {
    console.error(JSON.stringify({ bad, good, other }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, code: 170, credit: CREDIT }, null, 2));
}
