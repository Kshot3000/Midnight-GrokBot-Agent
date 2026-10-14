/**
 * Circuit-count bound checker for deploy weight.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/226
 * Related: https://github.com/midnightntwrk/servicedesk/issues/225
 * Official: https://docs.midnight.network/guides/compact-javascript-runtime
 *
 * midnight-js 4.1.1 deploys every exported circuit. Large verifier-key sets
 * can hit the 50_000 bytesWritten block limit (RPC 1010). This helper only
 * counts exported circuits in a Compact source. It does not compile, prove,
 * or submit.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE = join(__dirname, '../../../contracts/hello-midnight/subset-circuit-bound.compact');

const SOFT_MAX_CIRCUITS = 12; // practical single-tx deploy budget under 50k bytesWritten

export function countExportedCircuits(source) {
  const matches = source.match(/export\s+circuit\s+\w+/g) || [];
  return matches.length;
}

export function classifyDeployBudget(circuitCount) {
  if (circuitCount <= SOFT_MAX_CIRCUITS) {
    return {
      ok: true,
      note: `circuit count ${circuitCount} is within the lab soft max (${SOFT_MAX_CIRCUITS}). Full deploy in midnight-js 4.1.1 is the current path.`,
    };
  }
  return {
    ok: false,
    note: `circuit count ${circuitCount} exceeds the lab soft max (${SOFT_MAX_CIRCUITS}). Risk of RPC 1010 (bytesWritten / block limits). See servicedesk#226 for the subset-deploy request and #225 for the error surface.`,
  };
}

function main() {
  const source = readFileSync(SAMPLE, 'utf8');
  const count = countExportedCircuits(source);
  const result = classifyDeployBudget(count);
  console.log(JSON.stringify({ circuitCount: count, ...result }, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
