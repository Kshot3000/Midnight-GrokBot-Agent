/**
 * Source check for contracts/hello-midnight/exported-arg-disclose.compact.
 * Does not invoke the Compact compiler and does not invent runtime APIs.
 * Official: https://docs.midnight.network/relnotes/compact/compact-0-16-24-0
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_EXPORTED_ARG = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_RELEASE = 'https://docs.midnight.network/relnotes/compact/compact-0-16-24-0';

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
 * Check that constructor and exported circuit arguments that cross a public
 * boundary are wrapped in disclose, matching the Compact 0.16.0 breaking change.
 */
export function checkExportedArgDisclose(source) {
  const raw = String(source || '');
  const code = stripComments(raw);
  const failures = [];

  if (!/pragma\s+language_version\s+>=\s*0\.22\s*&&\s*<=\s*0\.23\s*;/.test(code)) {
    failures.push('language pin must be >= 0.22 && <= 0.23 (Compact ~0.31.1 lab pin)');
  }
  if (!/import\s+CompactStandardLibrary\s*;/.test(code)) {
    failures.push('import CompactStandardLibrary');
  }
  if (!/export\s+ledger\s+note:\s*Bytes<32>\s*;/.test(code)) {
    failures.push('note ledger cell');
  }
  if (!/witness\s+privateNote\s*\(\s*\)\s*:\s*Bytes<32>\s*;/.test(code)) {
    failures.push('privateNote witness');
  }
  if (!/constructor\s*\(\s*initial:\s*Bytes<32>\s*\)\s*\{[^}]*note\s*=\s*disclose\s*\(\s*initial\s*\)\s*;/.test(code)) {
    failures.push('constructor must disclose(initial) into the ledger');
  }
  if (!/export\s+circuit\s+setNote\s*\(\s*value:\s*Bytes<32>\s*\)\s*:\s*\[\s*\]\s*\{[^}]*note\s*=\s*disclose\s*\(\s*value\s*\)\s*;/.test(code)) {
    failures.push('setNote must disclose(value) into the ledger');
  }
  if (!/export\s+circuit\s+echoPrivate\s*\(\s*\)\s*:\s*Bytes<32>\s*\{[^}]*return\s+disclose\s*\(\s*privateNote\s*\(\s*\)\s*\)\s*;/.test(code)) {
    failures.push('echoPrivate must return disclose(privateNote())');
  }

  return {
    ok: failures.length === 0,
    failures,
    credit: CREDIT,
    upstream: UPSTREAM_EXPORTED_ARG,
    official: OFFICIAL_RELEASE,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const here = path.dirname(new URL(import.meta.url).pathname);
  const compactPath = path.resolve(here, '../../../contracts/hello-midnight/exported-arg-disclose.compact');
  const source = fs.readFileSync(compactPath, 'utf8');
  const result = checkExportedArgDisclose(source);
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}
