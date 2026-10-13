/**
 * Record Compact implementation-specific limits from the official reference.
 * Does not call a compiler, proof server, wallet, indexer, or node.
 * Does not invent APIs.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1387
 * Official: https://docs.midnight.network/compact/reference/compact-reference#implementation-specific-limits
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM_IMPL_LIMITS =
  'https://github.com/midnightntwrk/midnight-docs/issues/1387';
export const OFFICIAL_IMPL_LIMITS =
  'https://docs.midnight.network/compact/reference/compact-reference#implementation-specific-limits';

/** Maximum Field value (scalar field of the ZK system). */
export const MAX_FIELD =
  52435875175126190479447740508185965837690552500527637822603658699938581184512n;

/** Maximum Uint value (31 field bytes). */
export const MAX_UINT =
  452312848583266388373324160190187140051835877600158453279131187530910662655n;

/** Maximum length of Vector or Bytes. */
export const MAX_VECTOR_OR_BYTES = 16777216;

/** MerkleTree / HistoricMerkleTree maximum depth from release notes. */
export const MAX_MERKLE_DEPTH = 32;

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {number} length
 * @returns {{ ok: boolean, hint: string }}
 */
export function checkVectorLength(length) {
  if (typeof length !== 'number' || length < 0) {
    return { ok: false, hint: 'Length must be a non-negative number.' };
  }
  if (length > MAX_VECTOR_OR_BYTES) {
    return {
      ok: false,
      hint: `Vector/Bytes length ${length} exceeds the Compact limit ${MAX_VECTOR_OR_BYTES} (docs#1387).`,
    };
  }
  return { ok: true, hint: 'Within the documented Vector/Bytes limit.' };
}

function selfCheck() {
  const ok =
    checkVectorLength(16).ok &&
    !checkVectorLength(MAX_VECTOR_OR_BYTES + 1).ok &&
    MAX_MERKLE_DEPTH === 32;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  selfCheck();
}
