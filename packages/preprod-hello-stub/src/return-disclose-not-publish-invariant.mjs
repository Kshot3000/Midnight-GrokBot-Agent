/**
 * Source check for contracts/hello-midnight/return-disclose-not-publish.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/compact/reference/explicit-disclosure
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/266
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_RETURN_DISCLOSE = 'https://github.com/midnightntwrk/servicedesk/issues/266';
export const OFFICIAL_EXPLICIT_DISCLOSURE = 'https://docs.midnight.network/compact/reference/explicit-disclosure';

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

/**
 * Flag Compact that mis-states the return vs ledger distinction reported in
 * servicedesk#266. Official page requires disclose for returns of witness data;
 * tests show returns do not appear in the published transaction raw.
 */
export function checkReturnDiscloseNotPublish(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary');
  }
  if (!/export\s+ledger\s+stored:\s*Bytes<32>\s*;/.test(code)) {
    failures.push('stored ledger cell is the on-chain public boundary');
  }
  if (!/export\s+circuit\s+returnArg\s*\(\s*x:\s*Bytes<32>\s*\)\s*:\s*Bytes<32>\s*\{[\s\S]*?return\s+x\s*;/.test(code)) {
    failures.push('returnArg must return the argument without disclose()');
  }
  if (!/return\s+disclose\s*\(\s*secretValue\s*\(\s*\)\s*\)\s*;/.test(code)) {
    failures.push('returnWitness must return disclose(secretValue())');
  }
  if (!/stored\s*=\s*disclose\s*\(\s*x\s*\)\s*;/.test(code)) {
    failures.push('storeArg must write disclose(x) into the ledger');
  }
  if (/return\s+secretValue\s*\(\s*\)\s*;/.test(code)) {
    failures.push('do not return a witness without disclose()');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.23',
    compiler: '0.31.1',
    upstream: UPSTREAM_RETURN_DISCLOSE,
    official: OFFICIAL_EXPLICIT_DISCLOSURE,
    credit: CREDIT,
  };
}
