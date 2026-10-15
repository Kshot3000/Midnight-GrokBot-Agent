/**
 * Source check for the MerkleTree insert vs insertHash gap.
 * Does not compile Compact, does not call a node or proof server, and does
 * not invent a hash formula for insertHash.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/63
 * Official: https://docs.midnight.network/compact/reference/ledger-adt
 *   insert(item) inserts a new leaf at the first free index.
 *   insertHash(hash: Bytes<32>) inserts a new leaf with a given hash.
 *   findPathForLeaf is TypeScript-only and returns undefined if the leaf is absent.
 *
 * Lab pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/63';
export const DOCS = 'https://docs.midnight.network/compact/reference/ledger-adt';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

const here = dirname(fileURLToPath(import.meta.url));
export const COMPACT_PATH = join(here, '../../../contracts/hello-midnight/merkle-insert-hash.compact');

/**
 * @param {string} [source]
 * @returns {{ok: boolean, reasons: string[], credit: string}}
 */
export function checkMerkleInsertHashSource(source) {
  const text = source ?? readFileSync(COMPACT_PATH, 'utf8');
  const reasons = [];
  if (!/pragma language_version 0\.23/.test(text)) {
    reasons.push('expected language pin 0.23');
  }
  if (!/MerkleTree<\s*10\s*,\s*Bytes<32>\s*>/.test(text)) {
    reasons.push('expected MerkleTree<10, Bytes<32>> ledger field');
  }
  if (!/\.insert\(/.test(text)) {
    reasons.push('expected a documented insert(item) call');
  }
  if (!/\.insertHash\(/.test(text)) {
    reasons.push('expected a documented insertHash(hash) call');
  }
  if (/persistentHash|sha256|hash\s*\(/.test(text) && !/insertHash/.test(text)) {
    reasons.push('do not invent a hash formula for the insertHash leaf');
  }
  if (/findPathForLeaf/.test(text)) {
    reasons.push('findPathForLeaf is TypeScript-only; do not call it from Compact');
  }
  return { ok: reasons.length === 0, reasons, credit: CREDIT, upstream: UPSTREAM, docs: DOCS };
}

export function formatMerkleInsertHashReport(result) {
  const lines = [
    result.ok ? 'merkle-insert-hash source check: OK' : 'merkle-insert-hash source check: FAIL',
    ...result.reasons.map((r) => `  - ${r}`),
    `upstream: ${result.upstream}`,
    `docs: ${result.docs}`,
    result.credit,
  ];
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = checkMerkleInsertHashSource();
  console.log(formatMerkleInsertHashReport(result));
  process.exit(result.ok ? 0 : 1);
}
