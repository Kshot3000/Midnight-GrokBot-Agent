/**
 * Classify proof-server Docker command and healthcheck forms.
 *
 * Upstream: https://github.com/midnightntwrk/example-hello-world/issues/16
 * Official: https://docs.midnight.network/guides/local-proving
 * Does not start Docker and does not fix the public node, indexer, or proof server.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/example-hello-world/issues/16';
export const OFFICIAL = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string[]} command
 * @param {string} [healthcheck]
 */
export function classifyProofServerCommand(command, healthcheck = '') {
  const failures = [];
  if (!Array.isArray(command)) failures.push('command must be an array');
  else if (command.length !== 2) failures.push('command must be two elements');
  else if (command[0] !== 'midnight-proof-server') failures.push('first element must be midnight-proof-server');
  else if (command[1] !== '-v') failures.push('second element must be -v');
  if (typeof healthcheck === 'string' && /curl/.test(healthcheck)) {
    failures.push('healthcheck must not call curl');
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

export function checkProofServerCommand() {
  const good = classifyProofServerCommand(
    ['midnight-proof-server', '-v'],
    "echo > /dev/tcp/127.0.0.1/6300",
  );
  if (!good.ok) return good;

  const badSingle = classifyProofServerCommand(['midnight-proof-server -v']);
  if (badSingle.ok) return { ok: false, failures: ['single-string form must fail'], upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };

  const badCurl = classifyProofServerCommand(
    ['midnight-proof-server', '-v'],
    "curl -f http://localhost:6300/version",
  );
  if (badCurl.ok) return { ok: false, failures: ['curl healthcheck must fail'], upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };

  return { ok: true, upstream: UPSTREAM, official: OFFICIAL, credit: CREDIT };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = checkProofServerCommand();
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
