import { describe, expect, it } from 'vitest';
import { interpretSuccessfulSegments, builderCredit } from '../src/segment-polarity.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('interpretSuccessfulSegments', () => {
  it('treats true as failed on the measured three-contract partialSuccess map', () => {
    const map = new Map([
      [0, false],
      [2518, false],
      [24305, true],
      [29863, false],
    ]);
    const decoded = interpretSuccessfulSegments({ type: 'partialSuccess', successfulSegments: map });
    expect(decoded.polarity).toBe('inverted-on-partialSuccess');
    expect(decoded.segments.find((row) => row.segmentId === 24305)).toMatchObject({ reported: true, applied: false, failed: true });
    expect(decoded.segments.find((row) => row.segmentId === 2518)).toMatchObject({ reported: false, applied: true, failed: false });
    expect(decoded.upstream).toMatch(/issues\/186/);
  });

  it('marks every true entry failed in the all-stale control', () => {
    const decoded = interpretSuccessfulSegments({
      type: 'partialSuccess',
      successfulSegments: [[0, false], [1337, true], [20299, true]],
    });
    expect(decoded.segments.filter((row) => row.segmentId !== 0).every((row) => row.failed && !row.applied)).toBe(true);
  });

  it('does not invent a map when the field is absent', () => {
    const decoded = interpretSuccessfulSegments({ type: 'success' });
    expect(decoded.polarity).toBe('absent');
    expect(decoded.segments).toEqual([]);
  });

  it('keeps the lab credit block', () => {
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
