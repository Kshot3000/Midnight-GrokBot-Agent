/**
 * Classifies the PureInterfaceCircuit runtime refusal reported in servicedesk#249.
 * Does not contact any node, proof server, or compiler and does not invent APIs.
 * Official docs: pure circuits need no CircuitContext and are exposed via pureCircuits.
 *   https://docs.midnight.network/compact/reference/compact-reference
 *   https://docs.midnight.network/guides/compact-javascript-runtime
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_PURE_INTERFACE = 'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL_PURE_DOCS = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_JS_RUNTIME = 'https://docs.midnight.network/guides/compact-javascript-runtime';

export function classifyPureInterfaceError(err) {
  const text = String(err?.message ?? err ?? '').replace(/\s+/g, ' ').trim();
  const isPureInterface =
    /PureInterfaceCircuit/i.test(text) ||
    (/ModuleResolutionError/i.test(text) && /pure/i.test(text));

  if (!isPureInterface) {
    return {
      kind: 'not-pure-interface',
      reason: 'error text does not match PureInterfaceCircuit / ModuleResolutionError+pure',
      upstream: UPSTREAM_PURE_INTERFACE,
    };
  }

  return {
    kind: 'pure-interface-circuit',
    title: 'Call to pure circuit declared in a contract type refused',
    hint:
      'compactc accepts pure circuits inside contract type declarations, but compact-runtime refuses every call with ModuleResolutionError kind PureInterfaceCircuit. Pure circuits have no standalone proofs and are meant to be called via the generated pureCircuits object (no CircuitContext). CoIP 4 does not list this failure kind. See servicedesk#249.',
    docs: OFFICIAL_PURE_DOCS,
    jsRuntime: OFFICIAL_JS_RUNTIME,
    upstream: UPSTREAM_PURE_INTERFACE,
    raw: text,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample =
    'ModuleResolutionError kind PureInterfaceCircuit at runtime/src/contract.ts:606';
  const result = classifyPureInterfaceError(sample);
  console.log(JSON.stringify(result, null, 2));
  if (result.kind !== 'pure-interface-circuit') process.exit(1);
  console.log('self-check ok');
}
