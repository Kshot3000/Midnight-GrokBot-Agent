/**
 * Flag the PureInterfaceCircuit runtime refusal that midnight-js / compact-runtime raise
 * when a contract type declares a pure circuit and someone calls through it.
 * Also scans Compact source for the forbidden pure-in-contract-type pattern.
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

/**
 * Scan Compact source for a pure circuit declared inside a contract type.
 * This is the pattern that compiles but fails every call (servicedesk#249).
 * Local pure helpers outside a contract type are allowed.
 * @param {string} source
 * @returns {{ ok: boolean, hint: string }}
 */
export function scanPureInContractType(source) {
  if (typeof source !== 'string') {
    return { ok: false, hint: 'Expected Compact source string.' };
  }
  // Rough window: pure circuit appears after a contract type declaration.
  const pureInType = /contract\s+type\s+\w+[\s\S]{0,400}?pure\s+circuit/i.test(source);
  if (pureInType) {
    return {
      ok: false,
      hint: 'Pure circuit declared inside a contract type. Compiler accepts it; runtime refuses every call with PureInterfaceCircuit (servicedesk#249). Move the pure helper out of the type.',
    };
  }
  return { ok: true, hint: 'No pure-in-contract-type pattern detected.' };
}

/**
 * Note that CoIP 4 omits PureInterfaceCircuit from its failure kinds list.
 * @returns {string}
 */
export function coipOmissionNote() {
  return 'CoIP 4 lists 10 failure kinds and omits PureInterfaceCircuit (servicedesk#249). compact-runtime has 11 kinds.';
}

function selfCheck() {
  const bad = 'ModuleResolutionError: kind PureInterfaceCircuit';
  const good = 'ModuleResolutionError: kind OperationAbsent';
  const a = decodePureInterface(bad);
  const b = decodePureInterface(good);
  const srcBad = 'contract type Foo { pure circuit bar(): []; }';
  const srcOk = 'export pure circuit helper(): [] { return; } export circuit bump(): [] {}';
  const c = scanPureInContractType(srcBad);
  const d = scanPureInContractType(srcOk);
  const ok = a.ok && !b.ok && !c.ok && d.ok;
  console.log(ok ? 'PASS' : 'FAIL', a.ok, b.ok, c.ok, d.ok);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
