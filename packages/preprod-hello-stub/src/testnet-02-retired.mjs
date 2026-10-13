/**
 * Flag the retired testnet-02 network name in local text.
 * Does not call a node, indexer, proof server, or faucet.
 * Does not invent APIs. Does not claim to fix public endpoints.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1172
 * Official: https://docs.midnight.network/guides/networks-and-environments
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_TESTNET_02 =
  'https://github.com/midnightntwrk/midnight-docs/issues/1172';
export const OFFICIAL_NETWORKS =
  'https://docs.midnight.network/guides/networks-and-environments';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} text
 * @returns {{ ok: boolean, hits: string[], hint: string, upstream: string, official: string, credit: string }}
 */
export function checkRetiredNetwork(text) {
  if (typeof text !== 'string') {
    return {
      ok: true,
      hits: [],
      hint: 'No text to scan.',
      upstream: UPSTREAM_TESTNET_02,
      official: OFFICIAL_NETWORKS,
      credit: CREDIT,
    };
  }
  const hits = [];
  const re = /testnet-02/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    hits.push(m[0]);
  }
  if (hits.length > 0) {
    return {
      ok: false,
      hits,
      hint: 'testnet-02 is retired. Official docs say its endpoints no longer resolve. Use preview or preprod (see networks-and-environments).',
      upstream: UPSTREAM_TESTNET_02,
      official: OFFICIAL_NETWORKS,
      credit: CREDIT,
    };
  }
  return {
    ok: true,
    hits: [],
    hint: 'No retired testnet-02 name found.',
    upstream: UPSTREAM_TESTNET_02,
    official: OFFICIAL_NETWORKS,
    credit: CREDIT,
  };
}

function selfCheck() {
  const stale = 'rpc.testnet-02.midnight.network';
  const clean = 'rpc.preview.midnight.network';
  const a = checkRetiredNetwork(stale);
  const b = checkRetiredNetwork(clean);
  const ok = !a.ok && a.hits.length > 0 && b.ok;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
