/**
 * Pure-circuit local-only invariant for midnightntwrk/servicedesk#249.
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Official: https://docs.midnight.network/compact/reference/compact-reference
 * Official: https://docs.midnight.network/guides/compact-javascript-runtime
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/249
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_PURE_CROSS = 'https://github.com/midnightntwrk/servicedesk/issues/249';
export const OFFICIAL_LANG_REF = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_JS_RUNTIME = 'https://docs.midnight.network/guides/compact-javascript-runtime';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify a call site description against the #249 decision.
 * Local pureCircuits calls are valid; cross-contract calls to pure circuits are refused.
 * @param {{ kind?: string, exported?: boolean, hasLedgerOrWitness?: boolean }} site
 */
export function classifyPureCallSite(site = {}) {
  const kind = String(site.kind || '').toLowerCase();
  const exported = Boolean(site.exported);
  const impure = Boolean(site.hasLedgerOrWitness);

  if (impure) {
    return {
      ok: false,
      classification: 'not-pure',
      hint: 'Circuit contains ledger or witness use; it is impure and is not placed in pureCircuits.',
      upstream: UPSTREAM_PURE_CROSS,
      official: OFFICIAL_LANG_REF,
      credit: CREDIT,
    };
  }

  if (kind === 'cross-contract' || kind === 'cross') {
    return {
      ok: false,
      classification: 'cross-contract-refused',
      hint: 'servicedesk#249: pure circuits have no standalone proofs and are not valid cross-contract call targets. Local pureCircuits calls remain valid.',
      upstream: UPSTREAM_PURE_CROSS,
      official: OFFICIAL_JS_RUNTIME,
      credit: CREDIT,
    };
  }

  if (exported && (kind === 'local' || kind === 'purecircuits' || kind === '')) {
    return {
      ok: true,
      classification: 'local-purecircuits',
      hint: 'Exported pure circuit is callable via pureCircuits with native values and no CircuitContext (Compact 0.31.1 / language ~0.23).',
      upstream: UPSTREAM_PURE_CROSS,
      official: OFFICIAL_JS_RUNTIME,
      credit: CREDIT,
    };
  }

  return {
    ok: false,
    classification: 'unrecognized',
    hint: 'Expected kind "local"/"purecircuits" or "cross-contract".',
    upstream: UPSTREAM_PURE_CROSS,
    official: OFFICIAL_LANG_REF,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const local = classifyPureCallSite({ kind: 'local', exported: true });
  const cross = classifyPureCallSite({ kind: 'cross-contract', exported: true });
  const impure = classifyPureCallSite({ hasLedgerOrWitness: true });
  const ok = local.ok && !cross.ok && cross.classification === 'cross-contract-refused' && !impure.ok;
  if (!ok) {
    console.error(JSON.stringify({ local, cross, impure }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, classification: local.classification, credit: CREDIT }, null, 2));
}
