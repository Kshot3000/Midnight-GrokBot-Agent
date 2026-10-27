/**
 * Source-level invariant for return-boundary.compact.
 * Does not compile Compact, does not deploy, does not touch the public indexer or node.
 *
 * Checks that the lab sample contains the patterns described in
 * midnightntwrk/servicedesk#266 and the official security page.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compactPath = resolve(__dirname, '../../../contracts/hello-midnight/return-boundary.compact');

export function checkReturnBoundary() {
  const src = readFileSync(compactPath, 'utf8');
  const hasReturnArgNoDisclose = /export circuit returnArg[\s\S]*return x;/.test(src);
  const hasReturnWitnessDisclose = /return disclose\(secretMarker\(\)\);/.test(src);
  const hasStoreDisclose = /stored = disclose\(x\);/.test(src);
  const citesIssue = src.includes('servicedesk#266');
  const citesOfficial = src.includes('docs.midnight.network/guides/security-best-practices');

  if (!hasReturnArgNoDisclose) throw new Error('returnArg must return x without disclose');
  if (!hasReturnWitnessDisclose) throw new Error('returnWitness must disclose the witness');
  if (!hasStoreDisclose) throw new Error('storeArg must disclose into the ledger');
  if (!citesIssue) throw new Error('must cite servicedesk#266');
  if (!citesOfficial) throw new Error('must cite official security page');

  return {
    ok: true,
    note: 'source patterns match issue #266; returns leave the circuit but are not ledger writes',
  };
}
