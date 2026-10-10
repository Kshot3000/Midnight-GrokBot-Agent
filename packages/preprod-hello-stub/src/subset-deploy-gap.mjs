/**
 * Name the subset-deploy and multi-insert verifier-key gap in midnight-js 4.1.1.
 * Does not call deployContract, does not invent a subset or multi-insert API,
 * and does not submit a transaction.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/226
 * Official single-insert: https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitInsertVerifierKeyTx
 * Official MaintenanceUpdate: https://docs.midnight.network/api-reference/ledger/classes/MaintenanceUpdate
 * Official updatability: https://docs.midnight.network/guides/updatability
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_SUBSET_DEPLOY = 'https://github.com/midnightntwrk/servicedesk/issues/226';
export const OFFICIAL_SINGLE_INSERT =
  'https://docs.midnight.network/api-reference/midnight-js/@midnight-ntwrk/midnight-js-contracts/functions/submitInsertVerifierKeyTx';
export const OFFICIAL_MAINTENANCE_UPDATE =
  'https://docs.midnight.network/api-reference/ledger/classes/MaintenanceUpdate';
export const OFFICIAL_UPDATABILITY = 'https://docs.midnight.network/guides/updatability';

/** Practical one-transaction deploy threshold reported in servicedesk#226. */
export const PRACTICAL_CIRCUIT_THRESHOLD = 15;

/** midnight-js 4.1.1 exposes only the single-circuit insert. */
export const SINGLE_INSERT_SIGNATURE =
  'submitInsertVerifierKeyTx(providers, compiledContract, contractAddress, circuitId, newVk)';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Flag a circuit count that, per upstream, cannot fit in one deploy transaction
 * on the public networks (50_000 bytesWritten, ~65% practical share).
 * Does not measure actual verifier-key bytes and does not invent a deploy option.
 * @param {number} circuitCount
 */
export function flagSubsetDeployNeeded(circuitCount) {
  const n = Number(circuitCount);
  if (!Number.isFinite(n) || n < 0) {
    return {
      ok: false,
      message: 'circuitCount must be a non-negative number',
      upstream: UPSTREAM_SUBSET_DEPLOY,
      official: OFFICIAL_SINGLE_INSERT,
      credit: CREDIT,
    };
  }
  if (n > PRACTICAL_CIRCUIT_THRESHOLD) {
    return {
      ok: false,
      circuitCount: n,
      threshold: PRACTICAL_CIRCUIT_THRESHOLD,
      message: `roughly ${n} exported circuits exceed the practical one-transaction deploy limit reported upstream (~${PRACTICAL_CIRCUIT_THRESHOLD}). Deploy a subset then insert remaining verifier keys. midnight-js 4.1.1 only exposes the single-insert API: ${SINGLE_INSERT_SIGNATURE}. The ledger MaintenanceUpdate accepts an array of SingleUpdate.`,
      upstream: UPSTREAM_SUBSET_DEPLOY,
      official: OFFICIAL_SINGLE_INSERT,
      maintenance: OFFICIAL_MAINTENANCE_UPDATE,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    circuitCount: n,
    threshold: PRACTICAL_CIRCUIT_THRESHOLD,
    message: `circuit count ${n} is within the practical one-transaction threshold reported upstream`,
    upstream: UPSTREAM_SUBSET_DEPLOY,
    official: OFFICIAL_SINGLE_INSERT,
    credit: CREDIT,
  };
}

/**
 * Pure note of the official single-insert surface. Does not call it.
 */
export function noteSingleInsertApi() {
  return {
    signature: SINGLE_INSERT_SIGNATURE,
    multiInsertExposed: false,
    official: OFFICIAL_SINGLE_INSERT,
    ledgerAcceptsMany: true,
    ledgerType: 'MaintenanceUpdate.updates: SingleUpdate[]',
    upstream: UPSTREAM_SUBSET_DEPLOY,
    credit: CREDIT,
  };
}
