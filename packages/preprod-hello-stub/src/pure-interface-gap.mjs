/**
 * Flag pure circuits that appear inside a contract type declaration.
 * Ordinary exported pure circuits are fine on Compact 0.31.1 / language 0.23.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 * Official pure circuits: https://docs.midnight.network/guides/compact-javascript-runtime
 * Compact reference: https://docs.midnight.network/compact/reference/compact-reference
 *
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Does not invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PURE_INTERFACE = 'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL_JS_RUNTIME = 'https://docs.midnight.network/guides/compact-javascript-runtime';
export const OFFICIAL_REFERENCE = 'https://docs.midnight.network/compact/reference/compact-reference';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Look for "pure circuit" inside a contract type (interface) block.
 * A top-level "export pure circuit" is the supported form on language 0.23.
 * @param {string} source
 */
export function classifyPureInContractType(source) {
  const text = String(source || '');
  // contract type Adder { ... } or contract Adder { ... } used as an interface
  const typeBlock = text.match(/contract\s+(?:type\s+)?\w+\s*\{[\s\S]*?\}/);
  const pureInsideType = typeBlock ? /pure\s+circuit/.test(typeBlock[0]) : false;
  const topLevelPure = /export\s+pure\s+circuit/.test(text);

  if (pureInsideType) {
    return {
      ok: false,
      kind: 'pure-in-contract-type',
      hint: 'servicedesk#249: pure circuits in contract type declarations compile on 0.35 but every call is refused with PureInterfaceCircuit. Lab pins Compact 0.31.1 / language 0.23 / runtime 0.16.0; prefer ordinary export pure circuit and do not put pure in a contract type when targeting current networks.',
      upstream: UPSTREAM_PURE_INTERFACE,
      official: OFFICIAL_REFERENCE,
      credit: CREDIT,
    };
  }

  if (topLevelPure) {
    return {
      ok: true,
      kind: 'exported-pure-circuit',
      hint: 'Ordinary exported pure circuit. On 0.31.1 this emits JavaScript only (no ZKIR). See the Compact JavaScript runtime guide.',
      upstream: UPSTREAM_PURE_INTERFACE,
      official: OFFICIAL_JS_RUNTIME,
      credit: CREDIT,
    };
  }

  return {
    ok: true,
    kind: 'no-pure',
    hint: 'No pure circuit detected.',
    upstream: UPSTREAM_PURE_INTERFACE,
    official: OFFICIAL_REFERENCE,
    credit: CREDIT,
  };
}

function selfCheck() {
  const good = `pragma language_version 0.23;\nexport pure circuit add(a: Uint<8>, b: Uint<8>): Uint<16> { return a + b; }`;
  const bad = `pragma language_version 0.23;\ncontract type Adder { pure circuit add(a: Uint<8>, b: Uint<8>): Uint<16>; }`;
  const a = classifyPureInContractType(good);
  const b = classifyPureInContractType(bad);
  const ok = a.ok && a.kind === 'exported-pure-circuit' && !b.ok && b.kind === 'pure-in-contract-type';
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
