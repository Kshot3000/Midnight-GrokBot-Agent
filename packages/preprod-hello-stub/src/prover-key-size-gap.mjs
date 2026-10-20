/**
 * Classify reported prover-key sizes that make client-side proving impractical.
 * Does not generate keys, call a proof server, or invent Compact APIs.
 * Upstream: https://github.com/midnightntwrk/servicedesk/issues/203
 * Official: https://docs.midnight.network/guides/local-proving
 * Pins: Compact ~0.31.1 / language ~0.23, midnight-js 4.1.1, proof-server 8.1.0
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

export const UPSTREAM = 'https://github.com/midnightntwrk/servicedesk/issues/203';
export const OFFICIAL_LOCAL_PROVING = 'https://docs.midnight.network/guides/local-proving';

const CREDIT = [
  'Built by @kshot9000 https://x.com/kshot9000',
  'Email: kshot9000@gmail.com',
  'Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v',
  'Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation',
].join('\n');

/**
 * @param {string|number} input size in MB or a string containing one
 * @returns {{ ok: boolean, classification: string, mb?: number, hint: string, upstream: string, docs: string, credit: string }}
 */
export function classifyProverKeySize(input) {
  let mb = null;
  if (typeof input === 'number') {
    mb = input;
  } else if (typeof input === 'string') {
    const m = input.match(/(\d+(?:\.\d+)?)\s*MB/i);
    if (m) mb = Number(m[1]);
  }
  if (mb == null || Number.isNaN(mb)) {
    return {
      ok: false,
      classification: 'incomplete',
      hint: 'Pass a size in MB (e.g. 90 or "112 MB"). This helper does not generate keys.',
      upstream: UPSTREAM,
      docs: OFFICIAL_LOCAL_PROVING,
      credit: CREDIT,
    };
  }
  const impractical = mb >= 90;
  return {
    ok: true,
    classification: impractical ? 'impractical-for-client-side' : 'practical-size',
    mb,
    hint: impractical
      ? 'servicedesk#203 reports prover keys of 90–570 MB per circuit make client-side proving impractical. Prefer smaller circuits or hosted proving while native verification improvements are tracked. This does not fix the public proof server or compiler.'
      : 'Reported size is under the 90 MB threshold called out in servicedesk#203.',
    upstream: UPSTREAM,
    docs: OFFICIAL_LOCAL_PROVING,
    claim: 'sample classification only — not a compiler or proof-server fix',
    credit: CREDIT,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const a = classifyProverKeySize('112 MB');
  const b = classifyProverKeySize(50);
  const ok = a.ok && a.classification === 'impractical-for-client-side' && b.classification === 'practical-size';
  console.log(ok ? 'PASS' : 'FAIL', a.mb, b.mb);
  console.log(CREDIT);
  process.exit(ok ? 0 : 1);
}
