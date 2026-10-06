/**
 * Flag Compact circuits whose in-circuit foreign-curve checks match the
 * prover-key weight report in midnightntwrk/servicedesk#203.
 *
 * Official docs: the proof provider sends proof requests to a proof server.
 * https://docs.midnight.network/guides/deploy-and-operate
 * The documented start is a local proof server on port 6300:
 * https://docs.midnight.network/getting-started/installation
 *
 * Byte sizes in #203 are the reporter's measurements on Compact 0.33.0 /
 * language 0.25 / midnight-js 5.0.0-beta.6. This lab does not treat them as
 * node constants and does not bump the pins (Compact ~0.31.1, midnight-js
 * 4.1.1, proof-server 8.1.0). No key-reference API is added.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/203';
export const DOCS_PROVE = 'https://docs.midnight.network/guides/deploy-and-operate';
export const DOCS_START = 'https://docs.midnight.network/getting-started/installation';
export const PROOF_SERVER_IMAGE = 'midnightntwrk/proof-server:8.1.0';
export const LOCAL_PROOF_SERVER = 'http://localhost:6300';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function listForeignCurveCalls(source) {
  const text = stripComments(source);
  const names = [];
  const re = /\b(secp256k1EcdsaVerify|ecMul|ecMulGenerator|ecAdd)\s*\(/g;
  let match = re.exec(text);
  while (match) {
    names.push(match[1]);
    match = re.exec(text);
  }
  return names;
}

/**
 * Classify a prove path when the circuit source uses foreign-curve checks.
 * @param {string} source Compact source
 * @param {{ proverKeyBytes?: number, proofServerUrl?: string }} [options]
 */
export function assessProverKeyWeight(source, options = {}) {
  const calls = listForeignCurveCalls(source);
  const reportedBytes = Number.isFinite(options.proverKeyBytes) ? options.proverKeyBytes : null;
  const heavy = calls.length > 0 || (reportedBytes !== null && reportedBytes >= 45 * 1024 * 1024);
  const proofServerUrl = options.proofServerUrl || LOCAL_PROOF_SERVER;
  return {
    ok: !heavy,
    calls,
    reportedBytes,
    reportedBytesAreOfficial: false,
    proofServer: PROOF_SERVER_IMAGE,
    proofServerUrl,
    upstream: UPSTREAM,
    docs: DOCS_PROVE,
    start: DOCS_START,
    credit: CREDIT,
    title: heavy
      ? 'Foreign-curve check: keep proving on a proof server you control'
      : 'No foreign-curve call in this source',
    hint: heavy
      ? 'servicedesk#203 reports prover keys of tens to hundreds of MB when secp256k1 verification is expanded in Compact (reporter stack, not this pin). Official deploy guide sends proofs to a proof server; start the pinned image on localhost:6300. Do not upload witness data to an indexer. This lab does not add a key-reference protocol and does not change the public proof server.'
      : 'This source does not call secp256k1EcdsaVerify, ecMul, ecMulGenerator, or ecAdd. A later large .prover file is still a reporter measurement, not a published limit. Prove against proof-server 8.1.0 on localhost:6300.',
  };
}
