/**
 * return-arg-accepted-invariant.mjs
 * Source-level check that a Compact sample returns a circuit argument
 * without disclose(). Does not run the compiler.
 *
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function checkReturnArgAccepted(compactSource) {
  const hasReturnX = /return\s+x\s*;/.test(compactSource);
  const hasDiscloseOnReturn = /return\s+disclose\s*\(/.test(compactSource);
  const hasLanguagePin = /pragma\s+language_version/.test(compactSource);
  return {
    acceptedPatternPresent: hasReturnX && !hasDiscloseOnReturn && hasLanguagePin,
    citesIssue266: compactSource.includes('servicedesk/issues/266'),
  };
}

export function loadSample() {
  const path = join(__dirname, '../../../contracts/hello-midnight/return-arg-accepted-no-disclose.compact');
  return readFileSync(path, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const src = loadSample();
  const result = checkReturnArgAccepted(src);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.acceptedPatternPresent ? 0 : 1);
}
