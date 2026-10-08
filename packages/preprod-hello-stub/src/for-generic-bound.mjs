/**
 * Flag Compact for forms the language reference rejects, including a return
 * inside a for and a range bound that is neither a literal nor a generic
 * natural-number parameter.
 * Does not compile Compact and does not invent a compiler API.
 * Grammar: https://docs.midnight.network/compact/reference/compact-reference
 * Generic bounds: https://docs.midnight.network/relnotes/compact/toolchain-0.31.0
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const UPSTREAM_FOR_GENERIC = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_FOR = 'https://docs.midnight.network/compact/reference/compact-reference';
export const OFFICIAL_GENERIC_BOUNDS = 'https://docs.midnight.network/relnotes/compact/toolchain-0.31.0';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

const here = path.dirname(fileURLToPath(import.meta.url));
export const LAB_FOR_GENERIC = path.resolve(here, '../../../contracts/hello-midnight/for-generic-bound.compact');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function genericNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/<#([^>]+)>/g)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().replace(/^#/, '');
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) names.add(name);
    }
  }
  return names;
}

function forBodies(source) {
  const bodies = [];
  const re = /\bfor\s*\([^)]*\)\s*\{/g;
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

/**
 * @param {string} source
 */
export function checkForGenericBounds(source) {
  const raw = stripComments(source);
  const failures = [];
  const generics = genericNames(raw);
  const fors = [...raw.matchAll(/\bfor\s*\(([^)]*)\)/g)];
  for (const match of fors) {
    const header = match[1].replace(/\s+/g, ' ').trim();
    const range = /^const\s+[A-Za-z_][A-Za-z0-9_]*\s+of\s+([A-Za-z0-9_]+)\s*\.\.\s*([A-Za-z0-9_]+)$/.exec(header);
    const sized = /^const\s+[A-Za-z_][A-Za-z0-9_]*\s+of\s+[A-Za-z_][A-Za-z0-9_]*$/.exec(header);
    if (range) {
      const [start, end] = [range[1], range[2]];
      const startOk = /^\d+$/.test(start) || generics.has(start);
      const endOk = /^\d+$/.test(end) || generics.has(end);
      if (!startOk || !endOk) {
        failures.push(`for range ${start}..${end} is not a literal or a declared generic natural-number parameter`);
      }
      if (/^\d+$/.test(start) && /^\d+$/.test(end) && Number(end) < Number(start)) {
        failures.push(`for range ${start}..${end} has end < start; the reference makes that a static error`);
      }
      continue;
    }
    if (sized) continue;
    failures.push(`for (${header}) is not a literal/generic range or a Vector/Bytes/tuple iteration`);
  }
  for (const body of forBodies(raw)) {
    if (/\breturn\b/.test(body)) {
      failures.push('return inside for; the reference disallows return from within a for statement');
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    forCount: fors.length,
    generics: [...generics],
    upstream: UPSTREAM_FOR_GENERIC,
    official: OFFICIAL_FOR,
    toolchain: OFFICIAL_GENERIC_BOUNDS,
    credit: CREDIT,
  };
}

export function checkLabForGenericBound() {
  const source = fs.readFileSync(LAB_FOR_GENERIC, 'utf8');
  const result = checkForGenericBounds(source);
  if (!/export\s+circuit\s+countGeneric<#N>/.test(source)) {
    result.failures.push('lab sample missing countGeneric<#N>');
  }
  if (!/for\s*\(\s*const\s+i\s+of\s+0\.\.N\s*\)/.test(source)) {
    result.failures.push('lab sample missing generic range 0..N');
  }
  if (/\breturn\b/.test(stripComments(source).split('for')[1] || '')) {
    result.failures.push('lab sample returns from the for');
  }
  result.ok = result.failures.length === 0;
  return result;
}
