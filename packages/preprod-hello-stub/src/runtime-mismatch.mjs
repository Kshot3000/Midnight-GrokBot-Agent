/**
 * Name the cause when midnight-js deploy construction fails because the
 * contract runtime does not match the SDK copy.
 *
 * Does not invent deploy APIs. Classifies the two error strings recorded in
 * midnightntwrk/servicedesk#236. Does not fix the public indexer or node.
 *
 * Matrix pins (https://docs.midnight.network/relnotes/support-matrix):
 * Compact toolchain 0.31.1, compact-runtime 0.16.0, on-chain runtime 3.0.0,
 * Midnight.js 4.1.1. Mismatch how-to:
 * https://docs.midnight.network/how-to/fix-version-mismatches
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const SUPPORT_MATRIX = {
  compactToolchain: '0.31.1',
  compactRuntime: '0.16.0',
  onchainRuntime: '3.0.0',
  midnightJs: '4.1.1',
  docs: 'https://docs.midnight.network/relnotes/support-matrix',
  howTo: 'https://docs.midnight.network/how-to/fix-version-mismatches',
};

export const builderCredit = CREDIT;

function collectErrorText(err, depth = 0, seen = new Set()) {
  if (err == null || depth > 6) return '';
  if (typeof err === 'string' || typeof err === 'number') return String(err);
  if (typeof err !== 'object') return '';
  if (seen.has(err)) return '';
  seen.add(err);
  const parts = [];
  const keys = [
    ...Object.getOwnPropertyNames(err),
    ...Object.getOwnPropertySymbols(err),
  ];
  for (const key of ['message', 'name', 'cause']) {
    if (err[key] != null) parts.push(collectErrorText(err[key], depth + 1, seen));
  }
  for (const key of keys) {
    if (key === 'message' || key === 'name' || key === 'cause' || key === 'stack') continue;
    const value = err[key];
    if (value == null || typeof value === 'function') continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'object') {
      parts.push(collectErrorText(value, depth + 1, seen));
    }
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * @param {unknown} err
 * @returns {{kind: string, title: string, hint: string, upstream: string, docs: string, raw: string}}
 */
export function decodeRuntimeMismatch(err) {
  const raw = collectErrorText(err).replace(/\s+/g, ' ').trim();
  const upstream = 'https://github.com/midnightntwrk/servicedesk/issues/236';

  if (/coinPublicKey/i.test(raw) && /ContractConfigurationError|constructor context/i.test(raw)) {
    return {
      kind: 'runtime-version',
      title: 'Deploy construction failed because the contract runtime is not the midnight-js 4.1.1 runtime',
      hint: 'The reported text is ContractConfigurationError: Failed to configure constructor context with coin public key, caused by reading coinPublicKey of undefined. Issue 236 records this when a contract compiled by compactc 0.34.0 or 0.35.0 (checkRuntimeVersion 0.19.0 / 0.20.0) is loaded next to midnight-js 4.1.1. The support matrix pairs Midnight.js 4.1.1 with compact-runtime 0.16.0 and Compact toolchain 0.31.1. Recompile with that toolchain and install one compact-runtime 0.16.0. This decoder does not change midnight-js.',
      upstream,
      docs: SUPPORT_MATRIX.docs,
      raw,
    };
  }

  if (/expected instance of ContractMaintenanceAuthority/i.test(raw)) {
    return {
      kind: 'duplicate-onchain-runtime',
      title: 'Deploy construction failed because two copies of onchain-runtime-v3 are loaded',
      hint: 'The reported text is expected instance of ContractMaintenanceAuthority. Issue 236 records this when the contract package has its own @midnight-ntwrk/onchain-runtime-v3 even at the same version midnight-js uses. Install one copy (matrix: on-chain runtime 3.0.0) so both sides share the class. A matching compact-runtime with midnight-js\'s onchain-runtime-v3 copy is the case that still builds. This decoder does not dedupe node_modules.',
      upstream,
      docs: SUPPORT_MATRIX.howTo,
      raw,
    };
  }

  return {
    kind: 'not-runtime-mismatch',
    title: 'Not a recorded runtime-mismatch deploy error',
    hint: 'Issue 236 only names the coinPublicKey constructor failure and the ContractMaintenanceAuthority instance failure. Other deploy errors stay on the RPC decoder.',
    upstream,
    docs: SUPPORT_MATRIX.docs,
    raw,
  };
}

export function formatRuntimeMismatch(err) {
  const decoded = decodeRuntimeMismatch(err);
  return [decoded.title, decoded.hint, decoded.upstream, decoded.docs].join('\n');
}
