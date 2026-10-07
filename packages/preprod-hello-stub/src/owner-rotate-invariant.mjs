/**
 * Source check for the official Compact owner-rotation pattern.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/902
 * Official: https://docs.midnight.network/guides/security-best-practices
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/902';
export const OFFICIAL = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkOwnerRotate(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code) && !/pragma\s+language_version\s+0\.23\.0/.test(code)) {
    failures.push('language pin must be 0.23 (Compact compiler ~0.31.1 lab pin)');
  }
  if (!/export\s+ledger\s+owner:\s*Bytes<32>/.test(code)) {
    failures.push('owner must be Bytes<32> as in the official sample');
  }
  if (!/witness\s+secretKey\s*\(\s*\)\s*:\s*Bytes<32>/.test(code)) {
    failures.push('secretKey witness must return Bytes<32>');
  }
  if (/ownPublicKey\s*\(/.test(code)) {
    failures.push('do not gate rotation on ownPublicKey(); it is a prover-controlled witness');
  }
  if (!/persistentHash<Vector<2,\s*Bytes<32>>>/.test(code)) {
    failures.push('derivePublicKey must use persistentHash of a domain separator and the secret');
  }
  if (!/pad\s*\(\s*32\s*,\s*"hello-midnight:owner"\s*\)/.test(code)) {
    failures.push('domain separator must be distinct from a nullifier separator');
  }
  if (!/assert\s*\(\s*owner\s*==\s*pad\s*\(\s*32\s*,\s*""\s*\)\s*,\s*"owner already claimed"\s*\)/.test(code)) {
    failures.push('claimOwnership must refuse to overwrite an existing commitment');
  }
  if (!/owner\s*=\s*disclose\s*\(\s*derivePublicKey\s*\(\s*sk\s*\)\s*\)/.test(code)) {
    failures.push('claimOwnership must disclose the derived commitment on the ledger write');
  }
  if (!/export\s+circuit\s+rotateOwner\s*\(\s*newOwner:\s*Bytes<32>\s*\)/.test(code)) {
    failures.push('rotateOwner(newOwner: Bytes<32>) must exist');
  }
  if (!/assert\s*\(\s*derivePublicKey\s*\(\s*secretKey\s*\(\s*\)\s*\)\s*==\s*owner\s*,\s*"not owner"\s*\)/.test(code)) {
    failures.push('rotateOwner must re-derive the identity and assert it matches owner');
  }
  if (!/const\s+next\s*=\s*disclose\s*\(\s*newOwner\s*\)/.test(code)) {
    failures.push('rotateOwner must disclose newOwner before the ledger write');
  }
  if (!/assert\s*\(\s*next\s*!=\s*pad\s*\(\s*32\s*,\s*""\s*\)\s*,\s*"new owner must be non-empty"\s*\)/.test(code)) {
    failures.push('rotateOwner must refuse an empty new commitment');
  }
  if (!/assert\s*\(\s*next\s*!=\s*owner\s*,\s*"new owner must differ"\s*\)/.test(code)) {
    failures.push('rotateOwner must refuse a no-op rotation');
  }
  if (!/owner\s*=\s*next\s*;/.test(code)) {
    failures.push('rotateOwner must write the disclosed next commitment');
  }
  if (!/midnight-docs#902/.test(raw)) {
    failures.push('header must cite midnight-docs#902');
  }

  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkLabOwnerRotate() {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(here, '../../../contracts/hello-midnight/owner-rotate.compact'), 'utf8');
  return checkOwnerRotate(source);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkLabOwnerRotate();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
