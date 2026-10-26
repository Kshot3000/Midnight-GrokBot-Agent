// Local-true source check for the ownPublicKey() warning.
// Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
// Does not run compactc, does not deploy, does not call any public indexer or node.
//
// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, '../../../contracts/hello-midnight/own-public-key-warning.compact');

export function checkOwnPublicKeyWarningSample() {
  const src = readFileSync(samplePath, 'utf8');
  const hasPragma = /pragma language_version\s*>=\s*0\.23/.test(src);
  const hasWitness = /witness\s+secretKey\s*\(\s*\)\s*:\s*Bytes<32>/.test(src);
  const hasClaim = /export\s+circuit\s+claimOwnership/.test(src);
  const hasOnly = /export\s+circuit\s+onlyOwner/.test(src);
  const usesDiscloseOnStore = /owner\s*=\s*disclose\s*\(/.test(src);
  const noOwnPublicKeyGate = !/assert\s*\(\s*ownPublicKey\s*\(/.test(src);
  return {
    hasPragma,
    hasWitness,
    hasClaim,
    hasOnly,
    usesDiscloseOnStore,
    noOwnPublicKeyGate,
    ok: hasPragma && hasWitness && hasClaim && hasOnly && usesDiscloseOnStore && noOwnPublicKeyGate,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = checkOwnPublicKeyWarningSample();
  console.log(JSON.stringify(r, null, 2));
  if (!r.ok) process.exit(1);
}
