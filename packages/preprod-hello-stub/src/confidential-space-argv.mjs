/**
 * Reject undocumented Confidential Space flags on the local prove path.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/204
 * Official start: https://docs.midnight.network/guides/local-proving
 * Official image pull: https://docs.midnight.network/guides/run-proof-server
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_CONFIDENTIAL_SPACE =
  'https://github.com/midnightntwrk/servicedesk/issues/204';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';
export const OFFICIAL_RUN_PROOF_SERVER = 'https://docs.midnight.network/guides/run-proof-server';

export const PROOF_SERVER_PIN = 'midnightntwrk/proof-server:8.1.0';
export const DEFAULT_PROOF_PORT = 6300;

/** Flags and env names named on the local-proving and run-proof-server pages. */
export const DOCUMENTED_PROOF_FLAGS = Object.freeze([
  '--port',
  '--no-fetch-params',
  '--num-workers',
  '-v',
]);

export const DOCUMENTED_PROOF_ENV = Object.freeze([
  'MIDNIGHT_PROOF_SERVER_PORT',
  'MIDNIGHT_PARAM_SOURCE',
  'RUST_BACKTRACE',
]);

const UNDOCUMENTED_CONFIDENTIAL = [
  /confidential[\s_-]*space/i,
  /--tee\b/i,
  /gcp[-_]?confidential/i,
  /confidentialspace/i,
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify a local prove command the caller already has.
 * Does not run Docker, does not contact a proof server, and does not
 * implement Confidential Space. servicedesk#204 is an open review request.
 * @param {string} command
 */
export function classifyConfidentialSpaceArgv(command) {
  const text = String(command || '');
  const failures = [];
  const undocumented = UNDOCUMENTED_CONFIDENTIAL.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source,
  );

  if (!text.includes(PROOF_SERVER_PIN)) {
    failures.push(
      `local prove path pins ${PROOF_SERVER_PIN} (compatibility matrix / local proving). Do not rely on latest.`,
    );
  }
  if (undocumented.length > 0) {
    failures.push(
      'Confidential Space / TEE flags are not in the public proof-server guide. servicedesk#204 is an open review of midnight-ledger#765; this lab does not add those flags.',
    );
  }
  if (/midnight-node-toolkit/i.test(text)) {
    failures.push(
      'the documented image is midnightntwrk/proof-server, not midnight-node-toolkit.',
    );
  }

  return {
    ok: failures.length === 0,
    pin: PROOF_SERVER_PIN,
    port: DEFAULT_PROOF_PORT,
    documentedFlags: DOCUMENTED_PROOF_FLAGS,
    documentedEnv: DOCUMENTED_PROOF_ENV,
    undocumented,
    failures,
    upstream: UPSTREAM_CONFIDENTIAL_SPACE,
    official: OFFICIAL_LOCAL_PROVING,
    credit: CREDIT,
  };
}
