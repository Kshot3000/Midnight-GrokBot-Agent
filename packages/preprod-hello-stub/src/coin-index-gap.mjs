/**
 * Classify a ledger cell type that would publish a shielded coin value.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not invent a Compact API.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/213
 * Official: https://docs.midnight.network/compact/data-types/ledger-adt
 * Lab sample: contracts/hello-midnight/coin-index-gap.compact
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/213';
export const OFFICIAL = 'https://docs.midnight.network/compact/data-types/ledger-adt';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} typeName ledger cell type as written in Compact
 */
export function classifyCoinIndexCell(typeName) {
  const raw = String(typeName || '').trim();
  if (raw === 'QualifiedShieldedCoinInfo') {
    return {
      ok: false,
      kind: 'publishes-value',
      hint: 'writeCoin / insertCoin requires QualifiedShieldedCoinInfo, so the coin value is part of the public ledger cell. Issue #213 asks for the mtIndex without persisting the full coin.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  if (raw === 'Bytes<32>' || raw === 'Bytes<32>') {
    return {
      ok: true,
      kind: 'commitment-only',
      hint: 'A Bytes<32> cell can hold a persistentCommit opening. The lab sample uses this form. It does not return or store mtIndex.',
      upstream: UPSTREAM,
      official: OFFICIAL,
      credit: CREDIT,
    };
  }
  return {
    ok: false,
    kind: 'unrecognized',
    hint: 'Expected QualifiedShieldedCoinInfo or Bytes<32>.',
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const publishes = classifyCoinIndexCell('QualifiedShieldedCoinInfo');
  const commit = classifyCoinIndexCell('Bytes<32>');
  const ok = !publishes.ok && commit.ok && commit.kind === 'commitment-only';
  if (!ok) {
    console.error(JSON.stringify({ publishes, commit }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
