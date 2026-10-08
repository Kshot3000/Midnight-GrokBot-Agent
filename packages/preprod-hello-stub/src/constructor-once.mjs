/**
 * Count constructor definitions in a Compact source snippet.
 * Official: at most one constructor.
 * https://docs.midnight.network/compact/reference/compact-reference
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Does not compile Compact and does not call a node or indexer.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/compact/reference/compact-reference';
export const STDLIB = 'https://docs.midnight.network/compact/standard-library/exports';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

/**
 * @param {string} source Compact text
 */
export function classifyConstructorCount(source) {
  const code = stripComments(source);
  const matches = code.match(/\bconstructor\s*\(/g) || [];
  const count = matches.length;
  if (count > 1) {
    return {
      ok: false,
      kind: 'too-many-constructors',
      count,
      title: 'Compact allows at most one constructor',
      hint: 'The Compact reference says a program has the definition of at most one constructor. A second constructor() is not a documented form. This check does not compile the file.',
    };
  }
  if (count === 0) {
    return {
      ok: true,
      kind: 'no-constructor',
      count,
      title: 'No constructor in this snippet',
      hint: 'A constructor is optional. The reference only forbids more than one.',
    };
  }
  return {
    ok: true,
    kind: 'one-constructor',
    count,
    title: 'Single constructor',
    hint: 'Matches the Compact reference: at most one constructor, used to initialize public and private state.',
  };
}

export function selfCheck() {
  const failures = [];
  const here = dirname(fileURLToPath(import.meta.url));
  const samplePath = join(here, '../../../contracts/hello-midnight/constructor-once.compact');
  const sample = readFileSync(samplePath, 'utf8');
  const good = classifyConstructorCount(sample);
  if (!good.ok || good.count !== 1) failures.push('sample should have one constructor');
  const bad = classifyConstructorCount('constructor() {}\nconstructor() {}');
  if (bad.ok || bad.count !== 2) failures.push('two constructors should fail');
  const none = classifyConstructorCount('circuit store(): [] {}');
  if (!none.ok || none.kind !== 'no-constructor') failures.push('optional constructor');
  const commented = classifyConstructorCount('// constructor() {}\nconstructor() {}');
  if (!commented.ok || commented.count !== 1) failures.push('comment should not count');
  return { ok: failures.length === 0, failures, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = selfCheck();
  console.log(JSON.stringify({ upstream: UPSTREAM, official: OFFICIAL, stdlib: STDLIB, ...result }, null, 2));
  if (!result.ok) process.exit(1);
}
