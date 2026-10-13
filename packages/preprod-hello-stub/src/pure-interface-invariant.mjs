/**
 * Flag the PureInterfaceCircuit runtime refusal that midnight-js / compact-runtime raise
 * when a contract type declares a pure circuit and someone calls through it.
 * Does not call a node, indexer, proof server, or wallet.
 * Does not claim to fix the public compiler or runtime.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 * Official: https://docs.midnight.network/api-reference/compact-runtime/type-aliases/ModuleResolutionFailure
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PURE_INTERFACE =
  'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL_MODULE_FAILURE =
  'https://docs.midnight.network/api-reference/compact-runtime/type-aliases/ModuleResolutionFailure';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Detect the PureInterfaceCircuit kind in a ModuleResolutionError or similar text.
 * @param {string} text
 * @returns {{ ok: boolean, hint: string }}
 */
export function decodePureInterface(text) {
  if (typeof text !== 'string') {
    return { ok: false, hint: 'Expected a string error message.' };
  }
  if (/PureInterfaceCircuit/i.test(text) || /pure.*interface.*circuit/i.test(text)) {
    return {
      ok: true,
      hint: 'Contract type declared a pure circuit. The compiler accepts it, but every call fails at runtime because a pure circuit has no verifier key. Move pure helpers out of the contract type (servicedesk#249).',
    };
  }
  return { ok: false, hint: 'No PureInterfaceCircuit marker found.' };
}

function selfCheck() {
  const bad = 'ModuleResolutionError: kind PureInterfaceCircuit';
  const good = 'ModuleResolutionError: kind OperationAbsent';
  const a = decodePureInterface(bad);
  const b = decodePureInterface(good);
  const ok = a.ok && !b.ok;
  console.log(ok ? 'PASS' : 'FAIL', a.ok, b.ok);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
