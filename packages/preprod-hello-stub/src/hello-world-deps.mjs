/**
 * Prove path for the official hello-world example does not need axios or
 * testcontainers. Upstream still lists both.
 *
 * Upstream: https://github.com/midnightntwrk/example-hello-world/issues/41
 * Official proof server: https://docs.midnight.network/getting-started/installation
 * Official hello quick start (academy sunset): https://github.com/midnightntwrk/midnight-docs/issues/1396
 *
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, DApp Connector 4.0.1.
 * Does not remove upstream dependencies. Does not call a proof server.
 * Does not claim a public indexer or node fix.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

import { pathToFileURL } from 'node:url';

export const UPSTREAM_UNUSED_DEPS =
  'https://github.com/midnightntwrk/example-hello-world/issues/41';
export const UPSTREAM_HELLO_QUICKSTART =
  'https://github.com/midnightntwrk/midnight-docs/issues/1396';
export const OFFICIAL_PROOF_SERVER =
  'https://docs.midnight.network/getting-started/installation';

export const PROOF_SERVER_IMAGE = 'midnightntwrk/proof-server:8.1.0';
export const LOCAL_PROOF_SERVER = 'http://localhost:6300';
export const MIDNIGHT_JS = '4.1.1';
export const CONNECTOR_API = '4.0.1';

/** Names issue 41 asks the example to drop. Not used by the documented prove path. */
export const UNUSED_FOR_PROVE = ['axios', 'testcontainers'];

/** Packages the documented local prove path actually imports. */
export const REQUIRED_FOR_PROVE = [
  '@midnight-ntwrk/midnight-js-http-client-proof-provider',
  '@midnight-ntwrk/midnight-js-contracts',
];

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

export const builderCredit = CREDIT;

function depNames(packageJson) {
  const deps = packageJson && typeof packageJson === 'object' ? packageJson.dependencies : null;
  if (!deps || typeof deps !== 'object') return [];
  return Object.keys(deps);
}

/**
 * @param {unknown} packageJson parsed package.json from midnightntwrk/example-hello-world
 * @param {{ labDependencies?: Record<string, string> }} [options]
 */
export function classifyHelloWorldDeps(packageJson, options = {}) {
  const names = depNames(packageJson);
  const stillListed = UNUSED_FOR_PROVE.filter((name) => names.includes(name));
  const missingRequired = REQUIRED_FOR_PROVE.filter((name) => !names.includes(name));
  const labDeps = options.labDependencies || {};
  const labPullsUnused = UNUSED_FOR_PROVE.filter((name) => Object.prototype.hasOwnProperty.call(labDeps, name));
  const failures = [];
  if (missingRequired.length > 0) {
    failures.push(
      `documented prove path needs ${missingRequired.join(', ')} at midnight-js ${MIDNIGHT_JS}`,
    );
  }
  if (labPullsUnused.length > 0) {
    failures.push(
      `lab prove path must not depend on ${labPullsUnused.join(', ')} (example-hello-world#41)`,
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    stillListedUpstream: stillListed,
    unusedForProve: UNUSED_FOR_PROVE,
    requiredForProve: REQUIRED_FOR_PROVE,
    proofServer: PROOF_SERVER_IMAGE,
    proofServerUrl: LOCAL_PROOF_SERVER,
    start: `docker run -p 6300:6300 ${PROOF_SERVER_IMAGE} midnight-proof-server -v`,
    midnightJs: MIDNIGHT_JS,
    connector: CONNECTOR_API,
    note:
      'axios and testcontainers are still listed on example-hello-world main (issue 41). They are not part of local proving. Start proof-server 8.1.0 on localhost:6300. This check does not edit that repo.',
    upstream: UPSTREAM_UNUSED_DEPS,
    quickstart: UPSTREAM_HELLO_QUICKSTART,
    official: OFFICIAL_PROOF_SERVER,
    credit: CREDIT,
  };
}

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const upstream = {
    dependencies: {
      '@midnight-ntwrk/midnight-js-http-client-proof-provider': '4.1.1',
      '@midnight-ntwrk/midnight-js-contracts': '4.1.1',
      axios: '^1.15.0',
      testcontainers: '^11.13.0',
    },
  };
  const result = classifyHelloWorldDeps(upstream, { labDependencies: {} });
  if (!result.ok || result.stillListedUpstream.length !== 2) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, stillListedUpstream: result.stillListedUpstream, credit: CREDIT }, null, 2));
}
