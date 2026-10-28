/**
 * Flag axios and testcontainers in a package.json string.
 * Upstream: https://github.com/midnightntwrk/example-hello-world/issues/41
 * Official: https://docs.midnight.network/getting-started/hello-world
 * Does not call npm, yarn, a proof server, wallet, indexer, or node.
 * Does not invent APIs.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_UNUSED_DEPS = 'https://github.com/midnightntwrk/example-hello-world/issues/41';
export const OFFICIAL_HELLO = 'https://docs.midnight.network/getting-started/hello-world';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Parse a package.json text and report if axios or testcontainers appear in dependencies.
 * @param {string} packageJsonText
 */
export function classifyUnusedDeps(packageJsonText) {
  let pkg;
  try {
    pkg = JSON.parse(String(packageJsonText || '{}'));
  } catch {
    return {
      ok: false,
      kind: 'invalid-json',
      unused: [],
      hint: 'Could not parse package.json.',
      upstream: UPSTREAM_UNUSED_DEPS,
      official: OFFICIAL_HELLO,
      credit: CREDIT,
    };
  }
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const unused = [];
  if (deps.axios) unused.push('axios');
  if (deps.testcontainers) unused.push('testcontainers');
  const hasUnused = unused.length > 0;
  return {
    ok: !hasUnused,
    kind: hasUnused ? 'unused-deps' : 'clean',
    unused,
    hint: hasUnused
      ? `example-hello-world#41: ${unused.join(' and ')} declared but not referenced in the repo. Lab does not remove them from the upstream example.`
      : 'No axios or testcontainers in dependencies.',
    upstream: UPSTREAM_UNUSED_DEPS,
    official: OFFICIAL_HELLO,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const sample = JSON.stringify({
    dependencies: { axios: '^1.20.0', '@midnight-ntwrk/midnight-js': '4.1.1' },
    devDependencies: { testcontainers: '^11.13.0' },
  });
  const result = classifyUnusedDeps(sample);
  const ok = !result.ok && result.unused.includes('axios') && result.unused.includes('testcontainers');
  if (!ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, unused: result.unused, credit: CREDIT }, null, 2));
}
