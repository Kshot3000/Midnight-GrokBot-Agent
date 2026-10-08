/**
 * Source check for contracts/hello-midnight/untaken-compare.compact.
 * Does not invoke the compiler and does not invent Compact APIs.
 *
 * Official: proof construction considers both branches; relational compares
 * inside a conditional are on the 0.31.0 workaround list and can enlarge
 * the circuit.
 * https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const DOCS = 'https://docs.midnight.network/relnotes/compact/toolchain-0.31.0';
export const MATRIX = 'https://docs.midnight.network/relnotes/support-matrix';

export const builderCredit = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function ifBodies(source) {
  const bodies = [];
  const re = /\bif\s*\([^)]*\)\s*\{/g;
  let match;
  while ((match = re.exec(source))) {
    let depth = 1;
    let i = match.index + match[0].length;
    const start = i;
    while (i < source.length && depth > 0) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') depth -= 1;
      i += 1;
    }
    bodies.push(source.slice(start, i - 1));
  }
  return bodies;
}

export function checkUntakenCompareSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must stay on >= 0.22 && <= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/const under = value < cap;/.test(text)) {
    failures.push('storeIfUnderCap must hoist `value < cap` before the if');
  }
  if (!/assert\s*\(\s*under\s*,/.test(text)) {
    failures.push('the hoisted compare must be asserted before the conditional');
  }
  if (!/disclose\s*\(\s*value\s*\)/.test(text)) {
    failures.push('the ledger write must disclose the value');
  }
  const relational = /(?:<=|>=|<|>)/;
  for (const body of ifBodies(text)) {
    if (relational.test(body)) {
      failures.push('relational compare must stay outside the if (0.31.0 untaken-branch workaround enlarges the circuit)');
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: DOCS,
    matrix: MATRIX,
  };
}

export function checkUntakenCompareFile(filePath) {
  return checkUntakenCompareSource(readFileSync(filePath, 'utf8'));
}
