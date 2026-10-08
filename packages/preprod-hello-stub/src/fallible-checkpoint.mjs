/**
 * Fallible sections need kernel.checkpoint() first (node Custom error 118).
 *
 * Official:
 *   https://docs.midnight.network/compact/reference/ledger-adt
 *   https://docs.midnight.network/nodes/error-codes
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0.
 * Source scan only. Does not compile, prove, submit, or fix the public indexer or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_KERNEL = 'https://docs.midnight.network/compact/reference/ledger-adt';
export const OFFICIAL_ERRORS = 'https://docs.midnight.network/nodes/error-codes';
export const ERROR_CODE = 118;
export const ERROR_NAME = 'FallibleWithoutCheckpoint';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const builderCredit = CREDIT;

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

function circuitBodies(source) {
  const text = String(source);
  const bodies = [];
  const re = /export\s+circuit\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*(?::\s*\[[^\]]*\]\s*)?\{/g;
  let match;
  while ((match = re.exec(text))) {
    const start = match.index;
    const brace = text.indexOf('{', match.index);
    let depth = 0;
    let end = brace;
    for (let i = brace; i < text.length; i += 1) {
      if (text[i] === '{') depth += 1;
      else if (text[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const headerStart = Math.max(0, start - 180);
    bodies.push({
      name: match[1],
      prelude: text.slice(headerStart, start),
      body: text.slice(brace + 1, end),
    });
  }
  return bodies;
}

/**
 * A circuit is a fallible section only when a nearby comment says so.
 * Official fix for 118: kernel.checkpoint() at the start of that section.
 * @param {string} source
 */
export function classifyFallibleCheckpoint(source) {
  const failures = [];
  const checked = [];
  for (const circuit of circuitBodies(source)) {
    const marked = /fallible section/i.test(circuit.prelude) || /fallible section/i.test(circuit.body);
    if (!marked) continue;
    const code = stripComments(circuit.body);
    const checkpointAt = code.search(/kernel\s*\.\s*checkpoint\s*\(\s*\)/);
    const otherKernel = code.search(/kernel\s*\.\s*(?!checkpoint\b)[A-Za-z_]/);
    checked.push(circuit.name);
    if (checkpointAt < 0) {
      failures.push(`${circuit.name}: fallible section has no kernel.checkpoint() (Custom error ${ERROR_CODE} ${ERROR_NAME})`);
    } else if (otherKernel >= 0 && otherKernel < checkpointAt) {
      failures.push(`${circuit.name}: kernel.checkpoint() is not the first kernel call in the fallible section`);
    }
  }
  return {
    ok: failures.length === 0 && checked.length > 0,
    failures,
    checked,
    errorCode: ERROR_CODE,
    errorName: ERROR_NAME,
    fix: 'Add kernel.checkpoint() at the start of fallible sections.',
    upstream: UPSTREAM,
    officialKernel: OFFICIAL_KERNEL,
    officialErrors: OFFICIAL_ERRORS,
    note: 'Lab source check only. Does not compile, prove, or change the public node or indexer.',
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const missing = classifyFallibleCheckpoint('// fallible section\nexport circuit bad(): [] { kernel.self(); }');
  const good = classifyFallibleCheckpoint('// fallible section\nexport circuit ok(): [] { kernel.checkpoint(); kernel.self(); }');
  if (missing.ok || !good.ok) {
    console.error(JSON.stringify({ missing, good }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, errorCode: ERROR_CODE, credit: CREDIT }, null, 2));
}
