/**
 * Decode a local proof-server probe without calling one.
 * Official checks: https://docs.midnight.network/guides/local-proving
 * Kapa cluster (proof server unreachable on port 6300): https://github.com/midnightntwrk/midnight-docs/issues/1377
 *
 * Does not start Docker, does not claim the public proof server is fixed,
 * and does not invent endpoints beyond /health, /version, and /ready.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PROOF_READY = 'https://github.com/midnightntwrk/midnight-docs/issues/1377';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const PROOF_SERVER_PIN = '8.1.0';
export const PROOF_SERVER_IMAGE = 'midnightntwrk/proof-server:8.1.0';
export const DOCUMENTED_START =
  'docker run -p 6300:6300 midnightntwrk/proof-server:8.1.0 midnight-proof-server -v';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function refused(message) {
  return /ECONNREFUSED|connect ECONNREFUSED|127\.0\.0\.1:6300|localhost:6300/i.test(String(message || ''));
}

/**
 * @param {{
 *   errorCode?: string,
 *   errorMessage?: string,
 *   health?: { status?: string } | null,
 *   version?: string | null,
 *   ready?: { status?: string, jobsProcessing?: number, jobsPending?: number, jobCapacity?: number } | null,
 * }} probe
 */
export function classifyProofReady(probe = {}) {
  const errorMessage = probe.errorMessage ? String(probe.errorMessage) : '';
  const errorCode = probe.errorCode ? String(probe.errorCode) : '';
  const health = probe.health || null;
  const version = probe.version == null ? '' : String(probe.version).trim();
  const ready = probe.ready || null;
  const reasons = [];
  let kind = 'unknown';

  if (errorCode === 'ECONNREFUSED' || refused(errorMessage)) {
    kind = 'unreachable';
    reasons.push('connection refused on port 6300; the documented container is not accepting connections');
    reasons.push(`start pin: ${DOCUMENTED_START}`);
  } else if (version && version !== PROOF_SERVER_PIN) {
    kind = 'version-pin';
    reasons.push(`GET /version returned ${version}; lab and local-proving pin proof-server ${PROOF_SERVER_PIN}`);
  } else if (ready && Number(ready.jobsPending) > 0 && Number(ready.jobsProcessing) === 0) {
    kind = 'queued';
    reasons.push('GET /ready shows jobsPending climbing while jobsProcessing stays flat; the server is up, jobs are queued');
    reasons.push('docs: default proving workers are two; --num-workers adjusts that pool, not the HTTP worker count');
  } else if (health && health.status === 'ok' && ready && ready.status === 'ok' && Number(ready.jobsPending) === 0) {
    kind = 'ready';
    reasons.push('GET /health and GET /ready are ok and jobsPending is 0');
    if (version === PROOF_SERVER_PIN) reasons.push(`GET /version matches pin ${PROOF_SERVER_PIN}`);
  } else if (!ready && !errorMessage) {
    kind = 'incomplete';
    reasons.push('missing GET /ready; a live container is not the same as a working proof server');
  } else {
    kind = 'unknown';
    reasons.push('probe did not match ECONNREFUSED, a version pin miss, or the documented /ready queue shape');
  }

  return {
    kind,
    unreachable: kind === 'unreachable',
    queued: kind === 'queued',
    ready: kind === 'ready',
    reasons,
    proofServer: PROOF_SERVER_IMAGE,
    start: DOCUMENTED_START,
    upstream: UPSTREAM_PROOF_READY,
    official: OFFICIAL_LOCAL_PROVING,
    publicProofServerFixed: false,
    credit: CREDIT,
  };
}
