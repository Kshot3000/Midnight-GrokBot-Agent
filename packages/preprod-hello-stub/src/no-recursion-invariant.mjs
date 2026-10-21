/**
 * Compact no-recursion invariant checker.
 *
 * Official reference:
 *   https://docs.midnight.network/compact/reference/compact-reference
 * Recursion is disallowed. Circuits must compile to finite proving circuits.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * This helper scans a Compact source string for a circuit that appears to
 * call itself by name. It does not compile, prove, or deploy. It does not
 * invent APIs.
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1,
 * DApp Connector 4.0.1, proof-server 8.1.0.
 * Official docs only: https://docs.midnight.network/.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const REFERENCE =
  'https://docs.midnight.network/compact/reference/compact-reference';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Extract circuit names declared as `export circuit Name` or `circuit Name`.
 * @param {string} source
 * @returns {string[]}
 */
export function extractCircuitNames(source) {
  const names = [];
  const re = /(?:export\s+)?circuit\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  let m;
  while ((m = re.exec(source))) {
    names.push(m[1]);
  }
  return [...new Set(names)];
}

/**
 * Rough check: does any circuit body appear to call its own name?
 * Not a full parser. Looks for `name(` after the circuit declaration.
 * @param {string} source
 * @returns {{ok: boolean, recursive: string[], circuits: string[], credit: string}}
 */
export function checkNoRecursion(source) {
  const circuits = extractCircuitNames(source);
  const recursive = [];
  for (const name of circuits) {
    // Find the body roughly: from circuit declaration to next circuit or end.
    const start = source.indexOf(`circuit ${name}`);
    if (start < 0) continue;
    const rest = source.slice(start);
    const brace = rest.indexOf('{');
    if (brace < 0) continue;
    const bodyStart = rest.slice(brace + 1);
    const next = bodyStart.indexOf('circuit ');
    const body = next > 0 ? bodyStart.slice(0, next) : bodyStart;
    const callRe = new RegExp(`(?<!\\.)\\b${name}\\s*\\(`, 'g');
    const matches = body.match(callRe) || [];
    if (matches.length > 0) {
      recursive.push(name);
    }
  }
  return {
    ok: recursive.length === 0,
    recursive,
    circuits,
    credit: CREDIT,
  };
}

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// CLI: node no-recursion-invariant.mjs [file]
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const here = dirname(fileURLToPath(import.meta.url));
  const path = process.argv[2] || resolve(here, '../../../contracts/hello-midnight/no-recursion.compact');
  const source = fs.readFileSync(path, 'utf8');
  const result = checkNoRecursion(source);
  console.log(JSON.stringify({ ...result, file: path }, null, 2));
  process.exit(result.ok ? 0 : 1);
}
