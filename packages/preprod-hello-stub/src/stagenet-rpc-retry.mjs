/**
 * Classify the Stagenet RPC error that can be caused by a stalled validator backend.
 * Does not call any public RPC, indexer, or node.
 * Does not claim a fix of the public network.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/264
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM =
  'https://github.com/midnightntwrk/servicedesk/issues/264';
export const OFFICIAL =
  'https://docs.midnight.network/guides/networks-and-environments';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} message
 * @returns {{ ok: boolean, retry: boolean, note: string }}
 */
export function classifyStagenetContractStateError(message) {
  const text = String(message || '');
  if (/Unable to get requested contract state/i.test(text)) {
    return {
      ok: true,
      retry: true,
      note: 'Matches the error reported when a request hits the stalled Stagenet validator-04 backend (servicedesk#264). Retry the call.',
    };
  }
  return {
    ok: false,
    retry: false,
    note: 'Not the stalled-backend contract-state error.',
  };
}

function selfCheck() {
  const a = classifyStagenetContractStateError('Unable to get requested contract state');
  const b = classifyStagenetContractStateError('other error');
  const ok = a.retry && a.ok && !b.retry;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
