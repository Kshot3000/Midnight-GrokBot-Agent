/**
 * Source check for contracts/hello-midnight/bytes-uint-cast.compact and a
 * local reading of the Compact 0.31.0 convertBytesToUint maxval break.
 * Does not call convertBytesToUint, the compiler, or the proof server.
 *
 * Official: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
 * Cast table: https://docs.midnight.network/compact/reference/compact-reference
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
export const CAST_TABLE = 'https://docs.midnight.network/compact/reference/compact-reference';

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

export function checkBytesUintCastSource(source) {
  const text = stripComments(source);
  const failures = [];
  if (!/pragma language_version >= 0\.22 && <= 0\.23/.test(text)) {
    failures.push('language pin must stay on >= 0.22 && <= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/const asField = raw as Field;/.test(text)) {
    failures.push('storeBytesAsField must hoist `raw as Field` before the if');
  }
  if (/as\s+Uint\s*</.test(text)) {
    failures.push('Bytes to Uint is not an allowed Compact cast; use Field, or convertBytesToUint only in generated runtime code');
  }
  if (!/disclose\s*\(\s*asField\s*\)/.test(text)) {
    failures.push('the ledger write must disclose the hoisted Field');
  }
  for (const body of ifBodies(text)) {
    if (/\bas\s+Field\b/.test(body) || /\bas\s+Uint\b/.test(body) || /convertBytesToUint/.test(body)) {
      failures.push('byte-vector conversion must stay outside the if (0.31.0 untaken-branch workaround enlarges the circuit)');
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    docs: DOCS,
    castTable: CAST_TABLE,
  };
}

export function checkBytesUintCastFile(filePath) {
  return checkBytesUintCastSource(readFileSync(filePath, 'utf8'));
}

function flatten(error) {
  const parts = [];
  const seen = new Set();
  const visit = (value, depth) => {
    if (value == null || depth > 5 || seen.has(value)) return;
    if (typeof value === 'string') {
      parts.push(value);
      return;
    }
    if (typeof value !== 'object') return;
    seen.add(value);
    if (typeof value.message === 'string') parts.push(value.message);
    if (value.cause) visit(value.cause, depth + 1);
  };
  visit(error, 0);
  return parts.join('\n');
}

/**
 * Official 0.31.0 breaking change: convertBytesToUint maxval is bigint, not number.
 * This does not call the runtime. It only names the documented fix when a caller
 * already has a type error that mentions the function and maxval/number.
 * @param {unknown} error
 */
export function decodeConvertBytesMaxval(error) {
  const text = flatten(error);
  const mentionsFn = /convertBytesToUint/.test(text);
  const numberMaxval = /maxval/.test(text) && /number/.test(text);
  if (mentionsFn && numberMaxval) {
    return {
      ok: false,
      hint: 'Pass a JavaScript bigint for the maxval parameter of convertBytesToUint. Compact toolchain 0.31.0 changed maxval from number to bigint.',
      docs: DOCS,
      upstream: UPSTREAM,
    };
  }
  return {
    ok: true,
    hint: '',
    docs: DOCS,
    upstream: UPSTREAM,
  };
}

/**
 * Width in bits for a Uint the generated runtime would bound. Returns a bigint
 * so callers do not pass a number into maxval. Not a Compact API.
 * @param {number} widthBits
 */
export function maxvalBigint(widthBits) {
  if (!Number.isInteger(widthBits) || widthBits < 1 || widthBits > 64) {
    throw new TypeError('widthBits must be an integer from 1 to 64');
  }
  return (1n << BigInt(widthBits)) - 1n;
}
