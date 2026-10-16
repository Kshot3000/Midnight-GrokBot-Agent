/**
 * Source check for the official commitment/nullifier single-use pattern.
 * Does not compile Compact, does not call the proof server, and does not
 * submit a transaction.
 *
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private
 *
 * Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/concepts/how-midnight-works/keeping-data-private';

const CREDIT = `Built by @kshot9000 https://x.com/kshot9000
Email: kshot9000@gmail.com
Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation`;

function stripComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

export function checkCommitmentNullifier(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s*>=\s*0\.23/.test(code)) {
    failures.push('language pin must be >= 0.23');
  }
  if (!/HistoricMerkleTree<\s*10\s*,\s*Bytes<\s*32\s*>>/.test(code)) {
    failures.push('must declare HistoricMerkleTree<10, Bytes<32>> for commitments');
  }
  if (!/Set<\s*Bytes<\s*32\s*>>/.test(code)) {
    failures.push('must declare Set<Bytes<32>> for nullifiers');
  }
  if (!/authPath\.leaf\s*==\s*pk/.test(code) && !/path\.leaf\s*==/.test(code)) {
    failures.push('must bind path.leaf to the derived public key');
  }
  if (!/!authorizedNullifiers\.member/.test(code)) {
    failures.push('must assert nullifier is not already a member');
  }
  if (!/authorizedNullifiers\.insert/.test(code)) {
    failures.push('must insert the nullifier after the absence check');
  }
  if (!/hello-midnight:commitment/.test(code) || !/hello-midnight:nullifier/.test(code)) {
    failures.push('must use distinct domain separators for commitment and nullifier');
  }
  if (!/sk\s*!=\s*pad\(\s*32\s*,\s*""\s*\)/.test(code)) {
    failures.push('must assert secret is non-empty');
  }
  if (!CREDIT.split('\n').every((line) => raw.includes(line))) {
    failures.push('credit block missing');
  }

  return { ok: failures.length === 0, failures };
}

export function checkDefaultCommitmentNullifier() {
  const here = dirname(fileURLToPath(import.meta.url));
  const compact = readFileSync(
    join(here, '../../../contracts/hello-midnight/commitment-nullifier.compact'),
    'utf8',
  );
  return checkCommitmentNullifier(compact);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const result = checkDefaultCommitmentNullifier();
  if (!result.ok) {
    console.error(result.failures.join('\n'));
    process.exit(1);
  }
  console.log('commitment-nullifier invariant ok');
}
