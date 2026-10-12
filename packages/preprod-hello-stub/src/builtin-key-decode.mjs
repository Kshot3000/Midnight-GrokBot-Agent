/**
 * Decode the proof-server "couldn't find built-in key" reason that midnight-js drops.
 * Does not call a proof server, wallet, indexer, or node.
 * Does not claim to fix the public proof server or midnight-js.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/243
 * Official: https://docs.midnight.network/api-reference/error-reference/proof-server-errors
 * Pins: midnight-js 4.1.1, proof-server 8.1.0, Compact ~0.31.1
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_BUILTIN_KEY =
  'https://github.com/midnightntwrk/servicedesk/issues/243';
export const OFFICIAL_PROOF_ERRORS =
  'https://docs.midnight.network/api-reference/error-reference/proof-server-errors';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * Extract a built-in key name from a proof-server body or log line when present.
 * On 8.x the body is only "bad input"; on 9.x it is "bad input: `reason`".
 * The midnight-js 4.1.1 client drops the body, so this only helps when the body
 * is captured separately (verbose log or a future client).
 * @param {string} text
 * @returns {{ ok: boolean, key?: string, hint: string }}
 */
export function decodeBuiltinKey(text) {
  if (typeof text !== 'string') {
    return { ok: false, hint: 'Expected a string body or log line.' };
  }
  const m = text.match(/couldn't find built-in key\s+(\w+)/i);
  if (m) {
    return {
      ok: true,
      key: m[1],
      hint: `ZKIR or built-in key "${m[1]}" was not readable. Check that the circuit's ZKIR files are present and match the Compact compile (servicedesk#243).`,
    };
  }
  if (/bad input/i.test(text)) {
    return {
      ok: false,
      hint: 'Body is "bad input" but the specific reason was dropped by midnight-js 4.1.1. Enable MIDNIGHT_PROOF_SERVER_VERBOSE=true and check DEBUG logs (servicedesk#242 / #243).',
    };
  }
  return { ok: false, hint: 'No built-in key reason found.' };
}

function selfCheck() {
  const body9 = "bad input: `couldn't find built-in key increment`";
  const body8 = 'bad input';
  const other = 'Job Queue full';
  const a = decodeBuiltinKey(body9);
  const b = decodeBuiltinKey(body8);
  const c = decodeBuiltinKey(other);
  const ok = a.ok && a.key === 'increment' && !b.ok && !c.ok;
  console.log(ok ? 'PASS' : 'FAIL', a.key, b.ok, c.ok);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
