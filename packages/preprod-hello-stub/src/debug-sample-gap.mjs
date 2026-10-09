/**
 * Flag Compact test-and-debug samples that cannot run as written.
 * Does not compile Compact and does not call the proof server.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 * Official hello world: https://docs.midnight.network/getting-started/hello-world
 * Official page: https://docs.midnight.network/compact/test-and-debug
 * Official circuit context: https://docs.midnight.network/guides/security-best-practices
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1487';
export const OFFICIAL_PAGE = 'https://docs.midnight.network/compact/test-and-debug';
export const OFFICIAL_HELLO = 'https://docs.midnight.network/getting-started/hello-world';
export const OFFICIAL_CONTEXT = 'https://docs.midnight.network/guides/security-best-practices';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

function stripComments(source) {
  return String(source || '').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * @param {string} source
 */
export function scanDebugSample(source) {
  const code = stripComments(source);
  const failures = [];
  const hasCircuit = /export\s+circuit\s+\w+/.test(code);
  const hasPragma = /pragma\s+language_version\s+0\.23\s*;/.test(code);
  if (hasCircuit && !hasPragma) {
    failures.push(
      'Circuit source has no `pragma language_version 0.23;`. The hello-world tutorial requires that pragma before ledger and circuit declarations.',
    );
  }
  if (hasCircuit && /=\s*[^=\n]*\bamount\b/.test(code) && !/disclose\s*\(\s*amount\s*\)/.test(code)) {
    failures.push(
      'A ledger write uses the circuit argument `amount` without `disclose(amount)`. Hello world says a private circuit parameter cannot be stored in public ledger state without disclose.',
    );
  }
  if (/@jest\/globals/.test(code) && /impureCircuits/.test(code) && /ledgerState\s*:/.test(code) && !/createCircuitContext/.test(code)) {
    failures.push(
      'The sample calls impureCircuits with a handmade `{ privateState, ledgerState }` object and imports @jest/globals. The security guide builds context with compact-runtime createCircuitContext and reads `.context` from the circuit result.',
    );
  }
  return {
    ok: failures.length === 0,
    failures,
    upstream: UPSTREAM,
    officialPage: OFFICIAL_PAGE,
    officialHello: OFFICIAL_HELLO,
    officialContext: OFFICIAL_CONTEXT,
    credit: CREDIT,
  };
}

const BROKEN = `
const MAX_AMOUNT: Uint<64> = 1000000;
export ledger balance: Uint<64>;
export circuit transfer(amount: Uint<64>): [] {
  balance = balance - amount;
}
`;

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const result = scanDebugSample(BROKEN);
  if (result.ok || result.failures.length < 2) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, failures: result.failures.length, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
