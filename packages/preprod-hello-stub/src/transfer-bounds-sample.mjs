/**
 * Classify a transfer sample against the compilation problems reported in midnight-docs#1487.
 * Does not call the compiler, proof server, wallet, indexer, or node.
 * Does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official: https://docs.midnight.network/compact/test-and-debug
 * Official: https://docs.midnight.network/compact/reference/writing
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_TRANSFER_SAMPLE = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_TEST_DEBUG = 'https://docs.midnight.network/compact/test-and-debug';
export const OFFICIAL_WRITING = 'https://docs.midnight.network/compact/reference/writing';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} source Compact source
 */
export function classifyTransferSample(source) {
  const text = String(source || '');
  const beforeCircuit = text.split(/export\s+circuit/)[0] || '';
  const topLevelConst = /^\s*const\s+/m.test(beforeCircuit);
  const emptyBytes = /Bytes\s*<\s*32\s*>\s*\{\s*\}/.test(text);
  const ledgerWriteNoDisclose = /\bbalance\s*=\s*(?!disclose\()/.test(text);
  const problems = [];
  if (topLevelConst) problems.push('top-level const');
  if (emptyBytes) problems.push('empty Bytes<32>{}');
  if (ledgerWriteNoDisclose) problems.push('ledger write without disclose');

  return {
    ok: problems.length === 0,
    problems,
    kind: problems.length ? 'stale-sample' : 'corrected',
    hint: problems.length
      ? `midnight-docs#1487: the Test and debug transfer sample has ${problems.join(', ')}. See the lab pin in contracts/hello-midnight/transfer-bounds-sample.compact.`
      : 'No known compilation problems from the Test and debug transfer sample.',
    upstream: UPSTREAM_TRANSFER_SAMPLE,
    official: OFFICIAL_WRITING,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const stale = classifyTransferSample(
    'const MAX: Uint<64> = 1;\nexport circuit t(r: Bytes<32>): [] { assert(r != Bytes<32>{}); balance = balance - 1; }',
  );
  const good = classifyTransferSample(
    'export circuit transfer(recipient: Bytes<32>, amount: Uint<64>): [] { const MAX: Uint<64> = 1; assert(recipient != pad(32, \