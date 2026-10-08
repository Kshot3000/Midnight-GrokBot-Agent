/**
 * Flag Compact Uint widths above the documented 248-bit field-byte bound.
 * Does not compile Compact and does not call the proof server.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/relnotes/compact/compact-0-20-28-0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import { pathToFileURL } from 'node:url';

export const UPSTREAM = 'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL = 'https://docs.midnight.network/relnotes/compact/compact-0-20-28-0';
export const MAX_UINT_BITS = 248;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string} source
 */
export function checkUintWidth(source) {
  const raw = String(source || '');
  const failures = [];
  for (const match of raw.matchAll(/Uint\s*<\s*(\d+)\s*>/g)) {
    const bits = Number(match[1]);
    if (bits > MAX_UINT_BITS) {
      failures.push(
        `Uint<${bits}> exceeds the documented maximum of ${MAX_UINT_BITS} (8 * 31 field bytes). Wider unsigned values can fail in the proof server without a clear error.`,
      );
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    maxBits: MAX_UINT_BITS,
    upstream: UPSTREAM,
    official: OFFICIAL,
    credit: CREDIT,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const sample = 'export ledger wide: Uint<256>;\nexport ledger ok: Uint<64>;\n';
  const result = checkUintWidth(sample);
  if (result.ok || result.failures.length !== 1) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, maxBits: MAX_UINT_BITS, upstream: UPSTREAM, credit: CREDIT }, null, 2));
}
