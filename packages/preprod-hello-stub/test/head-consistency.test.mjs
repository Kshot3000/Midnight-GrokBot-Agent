import { describe, expect, it } from 'vitest';
import { parseHeaderNumber, summarizeHeadSamples, builderCredit } from '../src/head-consistency.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('preprod head consistency', () => {
  it('parses Substrate hex header numbers', () => {
    expect(parseHeaderNumber({ number: '0x2ac8f3' })).toBe(0x2ac8f3);
    expect(parseHeaderNumber('2804056')).toBe(2804056);
    expect(parseHeaderNumber({})).toBeNull();
  });

  it('flags a backwards head the way servicedesk 223 measured it', () => {
    const summary = summarizeHeadSamples([
      { height: 2804056 },
      { height: 2804051 },
      { height: 2804057 },
      { height: null, ok: false },
    ]);
    expect(summary.backwards).toBe(1);
    expect(summary.largestStepBack).toBe(5);
    expect(summary.monotonic).toBe(false);
    expect(summary.failed).toBe(1);
    expect(summary.upstream).toMatch(/issues\/223/);
    expect(builderCredit).toMatch(/kshot9000@gmail.com/);
  });

  it('accepts a non-decreasing head', () => {
    const summary = summarizeHeadSamples([{ height: 10 }, { height: 10 }, { height: 12 }]);
    expect(summary.monotonic).toBe(true);
    expect(summary.backwards).toBe(0);
  });
});
