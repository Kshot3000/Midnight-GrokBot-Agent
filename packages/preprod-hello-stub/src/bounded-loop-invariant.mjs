/**
 * Flag Compact sources that use a for form the language reference does not allow.
 * Does not compile Compact and does not invent a compiler API.
 * Grammar: https://docs.midnight.network/compact/reference/compact-reference
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

export const UPSTREAM_BOUNDED_LOOP = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_FOR = 'https://docs.midnight.network/compact/reference/compact-reference';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

const here = path.dirname(fileURLToPath(import.meta.url));
export const LAB_BOUNDED_LOOP = path.resolve(here, '../../../contracts/hello-midnight/bounded-loop.compact');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * @param {string} source
 */
export function checkBoundedLoops(source) {
  const raw = stripComments(source);
  const failures = [];
  const fors = [...raw.matchAll(/\bfor\s*\(([^)]*)\)/g)];
  if (fors.length === 0) {
    failures.push('no for statement; Compact loops must be a bounded for, not an open while');
  }
  for (const match of fors) {
    const header = match[1].replace(/\s+/g, ' ').trim();
    const range = /^const\s+[A-Za-z_][A-Za-z0-9_]*\s+of\s+(\d+)\s*\.\.\s*(\d+)$/.exec(header);
    const sized = /^const\s+[A-Za-z_][A-Za-z0-9_]*\s+of\s+[A-Za-z_][A-Za-z0-9_]*$/.exec(header);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (end < start) {
        failures.push(`for range ${start}..${end} has end < start; the reference makes that a static error`);
      }
      continue;
    }
    if (sized) continue;
    failures.push(`for (${header}) is not a literal range or a Vector/Bytes/tuple iteration`);
  }
  if (/\bwhile\s*\(/.test(raw)) {
    failures.push('while is not a Compact statement; loops must be bounded for forms');
  }
  const chunks = raw.split(/export\s+circuit\s+/);
  for (const chunk of chunks.slice(1)) {
    const name = /^([A-Za-z_][A-Za-z0-9_]*)/.exec(chunk);
    if (!name) continue;
    const body = chunk.slice(name[1].length);
    if (new RegExp('\\b' + name[1] + '\\s*\\(').test(body)) {
      failures.push('circuit ' + name[1] + ' calls itself; the reference disallows recursion');
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    forCount: fors.length,
    upstream: UPSTREAM_BOUNDED_LOOP,
    official: OFFICIAL_FOR,
    credit: CREDIT,
  };
}

export function checkLabBoundedLoop() {
  const source = fs.readFileSync(LAB_BOUNDED_LOOP, 'utf8');
  const result = checkBoundedLoops(source);
  const hasRange = /for\s*\(\s*const\s+i\s+of\s+0\.\.4\s*\)/.test(source);
  const hasVector = /for\s*\(\s*const\s+flag\s+of\s+flags\s*\)/.test(source);
  const pragma = /pragma\s+language_version\s+>=\s+0\.23\s*;/.test(source);
  if (!hasRange) result.failures.push('lab sample missing literal range 0..4');
  if (!hasVector) result.failures.push('lab sample missing Vector iteration');
  if (!pragma) result.failures.push('lab sample missing language_version >= 0.23');
  result.ok = result.failures.length === 0;
  return result;
}
