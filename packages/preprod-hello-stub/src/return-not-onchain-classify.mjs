/**
 * Classifier for the return-value vs on-chain disclosure distinction in servicedesk#266.
 * Does not call a node, indexer, proof server, or wallet.
 * Does not invent APIs.
 * Official: https://docs.midnight.network/guides/security-best-practices
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Classify text that confuses a circuit return with an on-chain disclosure.
 * @param {unknown} text
 * @returns {{ kind: string, hint: string }}
 */
export function classifyReturnNotOnchain(text) {
  const s = typeof text === 'string' ? text : String(text || '');
  if (/randomized commitment/.test(s) && /return value/.test(s)) {
    return {
      kind: 'official-return-not-onchain',
      hint: 'Matches the security guide: an exported-circuit return is not visible on chain; only a randomized commitment is in the transaction (servicedesk#266).',
    };
  }
  if (/return/.test(s) && /disclose/.test(s) && /ledger/.test(s) && /not in the transaction|not in the published/.test(s)) {
    return {
      kind: 'issue-266-probe',
      hint: 'Matches the probe in servicedesk#266: returned values reach the DApp but are absent from the transaction raw bytes.',
    };
  }
  return {
    kind: 'other',
    hint: 'Not the return-vs-ledger distinction from servicedesk#266.',
  };
}

function selfCheck() {
  const a = classifyReturnNotOnchain(
    'The return value of an exported circuit: No, the transaction carries only a randomized commitment to the call\'s inputs and outputs.',
  );
  const b = classifyReturnNotOnchain('unrelated error');
  const ok = a.kind === 'official-return-not-onchain' && b.kind === 'other';
  console.log(ok ? 'PASS' : 'FAIL', a.kind, b.kind);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
