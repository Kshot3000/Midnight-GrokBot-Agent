/**
 * Decode opaque deploy construction errors that hide a Compact runtime / onchain-runtime skew.
 * Does not call a node, indexer, proof server, or wallet.
 * Does not claim to fix the public midnight-js or indexer.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/236
 * Official: https://docs.midnight.network/how-to/fix-version-mismatches
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, compact-runtime 0.16.x
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_RUNTIME_MISMATCH =
  'https://github.com/midnightntwrk/servicedesk/issues/236';
export const OFFICIAL_VERSION_MISMATCH =
  'https://docs.midnight.network/how-to/fix-version-mismatches';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function textOf(error) {
  if (error == null) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && typeof error.message === 'string') {
    const cause = error.cause ? textOf(error.cause) : '';
    return `${error.name || ''}: ${error.message}${cause ? ' <- ' + cause : ''}`;
  }
  return String(error);
}

/**
 * @param {unknown} error
 * @returns {{ ok: boolean, kind: string, hint: string }}
 */
export function decodeRuntimeMismatch(error) {
  const text = textOf(error);
  if (/coinPublicKey/.test(text) && /undefined/.test(text)) {
    return {
      ok: true,
      kind: 'coinPublicKey-undefined',
      hint: 'Deploy construction failed with an undefined coinPublicKey. This commonly means the contract was compiled against a newer compact-runtime than midnight-js 4.1.1 (which pins 0.16.x). Align to the support matrix (servicedesk#236).',
    };
  }
  if (/ContractMaintenanceAuthority/.test(text)) {
    return {
      ok: true,
      kind: 'maintenance-authority',
      hint: 'Expected instance of ContractMaintenanceAuthority. This often means two physical copies of @midnight-ntwrk/onchain-runtime-v3 are loaded. Deduplicate the dependency and stay on the matrix versions (servicedesk#236).',
    };
  }
  return {
    ok: false,
    kind: 'other',
    hint: 'Not the runtime-mismatch shapes from servicedesk#236.',
  };
}

function selfCheck() {
  const a = decodeRuntimeMismatch(
    "TypeError: Cannot read properties of undefined (reading 'coinPublicKey')",
  );
  const b = decodeRuntimeMismatch('Error: expected instance of ContractMaintenanceAuthority');
  const c = decodeRuntimeMismatch('Failed Proof Server response: code="400"');
  const ok = a.ok && a.kind === 'coinPublicKey-undefined' && b.ok && !c.ok;
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind, c.ok);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
