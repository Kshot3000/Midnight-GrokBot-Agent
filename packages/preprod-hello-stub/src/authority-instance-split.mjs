/**
 * Split the two ContractMaintenanceAuthority deploy failures from the
 * 2026-10-09 retest on servicedesk#236. Does not call midnight-js and does
 * not invent a deploy API. Official class page:
 * https://docs.midnight.network/api-reference/ledger/classes/ContractMaintenanceAuthority
 * Support matrix: https://docs.midnight.network/relnotes/support-matrix
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_AUTHORITY_SPLIT = 'https://github.com/midnightntwrk/servicedesk/issues/236';
export const OFFICIAL_CMA = 'https://docs.midnight.network/api-reference/ledger/classes/ContractMaintenanceAuthority';
export const OFFICIAL_MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function flatten(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  const parts = [];
  if (typeof error.message === 'string') parts.push(error.message);
  if (error.cause) parts.push(flatten(error.cause));
  return parts.join('\n');
}

function uniqueCopies(paths) {
  return [...new Set((paths || []).map((item) => String(item).replace(/\\/g, '/').trim()).filter(Boolean))];
}

/**
 * Name why "expected instance of ContractMaintenanceAuthority" appeared.
 * Callers pass onchain copy paths they already have (npm list) and any
 * ledger note already in the error text. This does not submit a transaction.
 * @param {unknown} error
 * @param {{ onchainCopies?: readonly string[] }} [options]
 */
export function splitAuthorityInstance(error, options = {}) {
  const text = flatten(error);
  const copies = uniqueCopies(options.onchainCopies);
  const base = {
    pins: { midnightJs: '4.1.1', compactRuntime: '0.16.0', onchainRuntime: '3.0.0' },
    upstream: UPSTREAM_AUTHORITY_SPLIT,
    official: OFFICIAL_CMA,
    credit: CREDIT,
  };

  if (!/expected instance of ContractMaintenanceAuthority/.test(text)) {
    return { ...base, ok: true, kind: 'not-authority-instance', message: 'not the ContractMaintenanceAuthority instance error' };
  }

  const nestedRuntime = /onchain-runtime-v4|compact-runtime@0\.(19|20)/.test(text) || copies.length > 1;
  const ledger9 = /ledger-?9|Ledger8DeployOnV9/i.test(text);

  if (nestedRuntime && !ledger9) {
    return {
      ...base,
      ok: false,
      kind: 'nested-onchain-copy',
      copies,
      message: 'nested compact-runtime brought its own onchain-runtime (v3 or v4). midnight-js 4.1.1 expects one @midnight-ntwrk/onchain-runtime-v3 at 3.0.0. Install one copy; do not treat this as a maintenance-authority committee change.',
    };
  }

  if (ledger9 && copies.length <= 1) {
    return {
      ...base,
      ok: false,
      kind: 'ledger9-single-copy',
      copies,
      message: '0.16.0 contract on the ledger-9 offline deploy path still throws expected instance of ContractMaintenanceAuthority with one onchain-runtime copy. The 2026-10-09 retest says Ledger8DeployOnV9Error already exists and the offline builder never reaches it. Stay on the support-matrix midnight-js 4.1.1 pin; this lab does not wire that class.',
    };
  }

  return {
    ...base,
    ok: false,
    kind: 'authority-instance-unsplit',
    copies,
    message: 'expected instance of ContractMaintenanceAuthority can be a nested onchain-runtime (v3 or v4) or a 0.16.0 contract on the ledger-9 offline path with one copy. Pass npm-list paths or the ledger-9 note to split them. It is not a committee update.',
  };
}
