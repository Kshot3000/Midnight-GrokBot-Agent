/**
 * assert-function-like-invariant.mjs
 *
 * Classifier for the function-like assert form required since Compact 0.16.0.
 * Official: https://docs.midnight.network/relnotes/compact/compact-0-16-24-0
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Does not invent APIs. Does not call a proof server or node.
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const OLD_ASSERT = /assert\s+[^(\n]+\s+"[^"]+"\s*;/;
const NEW_ASSERT = /assert\s*\(/;

export function classifyAssertForm(source) {
  if (typeof source !== 'string') {
    return { ok: false, reason: 'source must be a string' };
  }
  const hasOld = OLD_ASSERT.test(source);
  const hasNew = NEW_ASSERT.test(source);
  if (hasOld && !hasNew) {
    return {
      ok: false,
      reason: 'old statement-style assert detected; use assert(cond, "msg")',
      upstream: 'https://github.com/midnightntwrk/midnight-docs/issues/1487',
      docs: 'https://docs.midnight.network/relnotes/compact/compact-0-16-24-0',
    };
  }
  if (hasNew) {
    return { ok: true, reason: 'function-like assert form present' };
  }
  return { ok: true, reason: 'no assert found' };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sample = 'assert(n < 100, "n out of bound");';
  const result = classifyAssertForm(sample);
  console.log(JSON.stringify(result, null, 2));
}
