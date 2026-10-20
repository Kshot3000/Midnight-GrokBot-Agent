/**
 * Source check for contracts/hello-midnight/matrix-pin-note.compact.
 *
 * Upstream: midnightntwrk/midnight-docs#1564
 * Official: https://docs.midnight.network/relnotes/support-matrix
 *
 * Does not compile Compact, does not call midnight-js, does not contact a proof server.
 * Does not claim a fix of the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(
  join(here, '../../../contracts/hello-midnight/matrix-pin-note.compact'),
  'utf8',
);

const hasPragma = /pragma\s+language_version\s*>=\s*0\.23/.test(source);
const hasDisclose = /disclose\s*\(/.test(source);
const hasLedgerWrite = /note\s*=\s*disclose/.test(source);

const ok = hasPragma && hasDisclose && hasLedgerWrite;

console.log(
  JSON.stringify(
    {
      ok,
      hasPragma,
      hasDisclose,
      hasLedgerWrite,
      upstream: 'midnightntwrk/midnight-docs#1564',
      pins: {
        compact: '~0.31.1',
        language: '>= 0.23',
        runtime: '0.16.0',
        midnightJs: '4.1.1',
        dappConnector: '4.0.1',
        proofServer: '8.1.0',
      },
    },
    null,
    2,
  ),
);

if (!ok) process.exitCode = 1;
