/**
 * Classify the board-input-bounds Compact source for required asserts.
 * Does not compile Compact, does not call a proof server, and does not contact a node or indexer.
 * Official pattern: https://docs.midnight.network/tutorials/bship/smart-contract
 * Pins: Compact ~0.31.1 / language ~0.23
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const OFFICIAL = 'https://docs.midnight.network/tutorials/bship/smart-contract';
export const SECURITY = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export function classifyBoardBoundsSource(source) {
  const text = String(source || '');
  const hasLower = /assert\(\s*x\s*>\s*0\s*,\s*["']No zero index/.test(text);
  const hasUpper = /assert\(\s*x\s*<=\s*20\s*,\s*["']Out of bounds/.test(text);
  const hasDisclose = /lastShot\s*=\s*disclose\(\s*x\s*\)/.test(text);
  const hasPragma = /pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23/.test(text);

  return {
    ok: hasLower && hasUpper && hasDisclose && hasPragma,
    hasLower,
    hasUpper,
    hasDisclose,
    hasPragma,
    hint: hasLower && hasUpper && hasDisclose && hasPragma
      ? 'source has the required board bounds asserts, disclose, and language pin'
      : 'source is missing one or more required asserts, disclose assignment, or language pin',
    official: OFFICIAL,
    security: SECURITY,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(here, '../../../contracts/hello-midnight/board-input-bounds.compact');
  const source = readFileSync(sourcePath, 'utf8');
  const result = classifyBoardBoundsSource(source);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, official: OFFICIAL, credit: CREDIT }, null, 2));
}
