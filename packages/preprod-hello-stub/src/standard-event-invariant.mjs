/**
 * Source check for contracts/hello-midnight/standard-event-emit.compact.
 * Does not invoke the Compact compiler and does not invent event APIs.
 * Official: https://docs.midnight.network/compact/reference/compact-reference
 * Stdlib: https://docs.midnight.network/compact/standard-library/exports
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_STANDARD_EVENT = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_EMIT = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_EVENTS = 'https://docs.midnight.network/compact/standard-library/exports';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

// Names confirmed on the Compact standard-library events page.
const STANDARD_EVENTS = [
  'ShieldedSpend',
  'ShieldedReceive',
  'ShieldedMint',
  'ShieldedBurn',
  'UnshieldedSpend',
];

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function constructorBody(code) {
  const start = code.search(/constructor\s*\([^)]*\)\s*\{/);
  if (start < 0) return null;
  const open = code.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === '{') depth += 1;
    else if (code[i] === '}') {
      depth -= 1;
      if (depth === 0) return code.slice(open + 1, i);
    }
  }
  return null;
}

/**
 * Flag Compact that invents an event struct or emits from the constructor.
 * Official rule: emit(e) requires a standard event type and is a static
 * error in the constructor. ShieldedSpend serializes to 32 bytes.
 */
export function checkStandardEventSource(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary so ShieldedSpend is in scope');
  }
  if (!/export\s+circuit\s+spend\s*\(\s*n:\s*Bytes<32>\s*\)\s*:\s*\[\]/.test(code)) {
    failures.push('spend must be an exported circuit returning [] (the type of emit)');
  }
  if (!/emit\s*\(\s*ShieldedSpend\s*\{\s*nullifier:\s*disclose\s*\(\s*n\s*\)\s*\}\s*\)/.test(code)) {
    failures.push('spend must emit(ShieldedSpend { nullifier: disclose(n) })');
  }
  if (!/return\s+deserialize<ShieldedSpend,\s*32>\s*\(\s*x\s*\)\s*;/.test(code)) {
    failures.push('decode with deserialize<ShieldedSpend, 32> (documented serialized size)');
  }

  const ctor = constructorBody(code);
  if (ctor == null) {
    failures.push('constructor must exist and must not emit');
  } else if (/\bemit\s*\(/.test(ctor)) {
    failures.push('constructor must not emit; that is a static error');
  }

  const emitTargets = [...code.matchAll(/\bemit\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]);
  if (emitTargets.length === 0) {
    failures.push('missing emit of a standard event type');
  }
  for (const name of emitTargets) {
    if (!STANDARD_EVENTS.includes(name)) {
      failures.push(`${name} is not a standard event type; a user-declared struct cannot be emitted`);
    }
  }
  if (/struct\s+[A-Za-z_][A-Za-z0-9_]*\s*\{[\s\S]*?\}\s*;?[\s\S]*emit\s*\(/.test(code)) {
    failures.push('do not declare a custom event struct and emit it');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.23',
    compiler: '0.31.1',
    event: 'ShieldedSpend',
    serializedSize: 32,
    upstream: UPSTREAM_STANDARD_EVENT,
    official: OFFICIAL_EMIT,
    stdlib: OFFICIAL_EVENTS,
    credit: CREDIT,
  };
}
