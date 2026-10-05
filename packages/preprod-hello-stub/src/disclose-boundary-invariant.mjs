/**
 * Source check for contracts/hello-midnight/disclose-boundary.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/guides/security-best-practices
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1245
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_DISCLOSE = 'https://github.com/midnightntwrk/midnight-docs/issues/1245';
export const OFFICIAL_DISCLOSE = 'https://docs.midnight.network/guides/security-best-practices';

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
 * Flag Compact that treats disclose() as the publish. Official rule: disclose
 * clears the private-data check. Visibility is the ledger write, an exported
 * return, or a contract-to-contract call.
 */
export function checkDiscloseBoundary(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary');
  }
  if (!/export\s+ledger\s+published:\s*Bytes<32>\s*;/.test(code)) {
    failures.push('published ledger cell is the public boundary for the note');
  }
  if (!/published\s*=\s*disclose\s*\(\s*note\s*\)\s*;/.test(code)) {
    failures.push('publishNote must write disclose(note) into the ledger');
  }
  if (!/const\s+cleared\s*=\s*disclose\s*\(\s*note\s*\)\s*;/.test(code)) {
    failures.push('holdPrivate must disclose into a local, not a ledger field');
  }
  const hold = code.match(/export\s+circuit\s+holdPrivate[\s\S]*?\n\}/);
  if (!hold) {
    failures.push('holdPrivate circuit missing');
  } else if (/published\s*=/.test(hold[0]) || /return\s+/.test(hold[0])) {
    failures.push('holdPrivate must not write published or return the note');
  }
  if (/disclose\s*\([^)]*\)\s+publishes/.test(raw)) {
    failures.push('do not describe disclose() as the publish; the ledger write is');
  }

  return {
    ok: failures.length === 0,
    failures,
    language: '>= 0.23',
    compiler: '0.31.1',
    upstream: UPSTREAM_DISCLOSE,
    official: OFFICIAL_DISCLOSE,
    credit: CREDIT,
  };
}
