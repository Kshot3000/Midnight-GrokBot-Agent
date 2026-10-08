/**
 * Flag a Compact circuit that calls sendUnshielded without a comparison
 * from the official unshielded balance family, and flag unshieldedBalance()
 * used as an exact-match read.
 *
 * Official: https://docs.midnight.network/compact/standard-library/exports
 * Tutorial: https://docs.midnight.network/tutorials/private-party/smart-contract
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/117
 * Does not compile Compact, submit a transaction, or fix the public node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/117';
export const OFFICIAL = 'https://docs.midnight.network/compact/standard-library/exports';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

const COMPARE = /unshieldedBalance(?:Gte|Gt|Lte|Lt)\s*\(/;

function circuits(source) {
  const text = String(source ?? '');
  const parts = text.split(/export\s+circuit\s+/);
  return parts.slice(1).map((part) => {
    const name = part.match(/^([A-Za-z_][A-Za-z0-9_]*)/)?.[1] ?? 'unknown';
    return { name, body: part };
  });
}

export function checkUnshieldedBalance(source) {
  const findings = [];
  for (const circuit of circuits(source)) {
    const sends = /sendUnshielded\s*\(/.test(circuit.body);
    const compared = COMPARE.test(circuit.body);
    const exact = /unshieldedBalance\s*\(/.test(circuit.body);
    if (sends && !compared) {
      findings.push({
        circuit: circuit.name,
        kind: 'send-without-compare',
        hint: 'Official stdlib: before sendUnshielded, assert unshieldedBalanceGte (or Gt). unshieldedBalance() is fixed at execution start and fails application unless the balance matches exactly.',
      });
    }
    if (exact) {
      findings.push({
        circuit: circuit.name,
        kind: 'exact-balance-read',
        hint: 'Official stdlib prefers unshieldedBalanceLt/Gte/Gt/Lte. unshieldedBalance() fails unless the construction-time balance equals the application-time balance.',
      });
    }
  }
  return {
    ok: findings.length === 0,
    findings,
    upstream: UPSTREAM,
    official: OFFICIAL,
    dismissNote: 'servicedesk#117: receiveUnshielded/sendUnshielded can still be rejected as Custom error 231 FeeCalculation.OutsideTimeToDismiss even when the call is smaller than an accepted pure-state call. This check does not fix the public node.',
    credit: CREDIT,
  };
}

export function formatUnshieldedBalance(result) {
  const lines = result.findings.map((f) => `${f.circuit}: ${f.kind} — ${f.hint}`);
  if (lines.length === 0) lines.push('no sendUnshielded without a balance comparison');
  lines.push(result.dismissNote);
  lines.push(CREDIT);
  return lines.join('\n');
}
