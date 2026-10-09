/**
 * Classify createCircuitContext call shape against the lab pin.
 * Does not call compact-runtime, midnight-js, or a proof server.
 * Does not invent APIs.
 *
 * Matrix pin (Compact ~0.31.1, compact-runtime 0.16.0, midnight-js 4.1.1):
 *   https://docs.midnight.network/guides/compact-javascript-runtime
 *   createCircuitContext(contractAddress, coinPublicKey, contractState, privateState)
 *   impure circuit calls return { result, context, proofData, gasCost } synchronously.
 *
 * Published API reference (compact-runtime 0.19.0, not this lab pin):
 *   https://docs.midnight.network/api-reference/compact-runtime/functions/createCircuitContext
 *   createCircuitContext(circuitId, contractAddress, coinPublicKeyOrZswapState, contractState, privateState, ...)
 *   midnight-docs#1487 notes that reference takes the circuit name first and that
 *   circuit calls return promises.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_RUNTIME_ARITY =
  'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const GUIDE_016 =
  'https://docs.midnight.network/guides/compact-javascript-runtime';
export const API_019 =
  'https://docs.midnight.network/api-reference/compact-runtime/functions/createCircuitContext';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const PINS = {
  compact: '0.31.1',
  language: '>= 0.23',
  compactRuntime: '0.16.0',
  midnightJs: '4.1.1',
  dappConnector: '4.0.1',
  proofServer: '8.1.0',
};

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function splitArgs(argText) {
  const args = [];
  let current = '';
  let depth = 0;
  for (const ch of argText) {
    if (ch === '(' || ch === '{' || ch === '[') depth += 1;
    if (ch === ')' || ch === '}' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function createCircuitCalls(code) {
  const calls = [];
  const re = /createCircuitContext\s*\(/g;
  let match;
  while ((match = re.exec(code))) {
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    for (; i < code.length && depth > 0; i += 1) {
      if (code[i] === '(') depth += 1;
      else if (code[i] === ')') depth -= 1;
    }
    calls.push(splitArgs(code.slice(start, i - 1)));
  }
  return calls;
}

/**
 * @param {string} source
 * @returns {{ok: boolean, shape: string, failures: string[], hints: string[], pins: object, upstream: string, credit: string}}
 */
export function checkRuntimeContextArity(source) {
  const code = stripComments(source);
  const failures = [];
  const hints = [];
  const calls = createCircuitCalls(code);
  let shape = 'absent';

  if (calls.length === 0) {
    failures.push('no createCircuitContext call to classify');
    hints.push('copy the 0.16.0 guide form, not the 0.19.0 API reference form');
  }

  for (const args of calls) {
    if (args.length >= 5 && /['"`]/.test(args[0])) {
      shape = 'api-reference-0.19.0';
      failures.push(
        'createCircuitContext starts with a circuit id; that is the compact-runtime 0.19.0 reference, not compact-runtime 0.16.0',
      );
      hints.push(
        'on the lab pin use createCircuitContext(address, coinPublicKey, contractState, privateState)',
      );
    } else if (args.length === 4) {
      shape = shape === 'api-reference-0.19.0' ? shape : 'guide-0.16.0';
    } else if (args.length !== 4) {
      shape = 'unknown';
      failures.push(
        `createCircuitContext has ${args.length} arguments; the 0.16.0 guide uses 4`,
      );
    }
  }

  if (/await\s+[A-Za-z0-9_.]*impureCircuits\./.test(code)) {
    failures.push(
      'await on impureCircuits matches the 0.19.0 reference (calls return promises); 0.16.0 returns { result, context, proofData, gasCost }',
    );
    hints.push('do not await the circuit call on compact-runtime 0.16.0');
  }

  return {
    ok: failures.length === 0 && shape === 'guide-0.16.0',
    shape,
    failures,
    hints,
    pins: PINS,
    upstream: UPSTREAM_RUNTIME_ARITY,
    guide: GUIDE_016,
    apiReference: API_019,
    credit: CREDIT,
  };
}

const sample = process.argv[2];
if (sample && import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const report = checkRuntimeContextArity(fs.readFileSync(sample, 'utf8'));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
}
