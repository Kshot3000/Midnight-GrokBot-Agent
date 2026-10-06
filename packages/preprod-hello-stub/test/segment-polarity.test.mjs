import { describe, expect, it } from 'vitest';
import { decodeLedgerSuccessfulSegments, checkSegmentPolarity, builderCredit } from '../src/segment-polarity.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('ledger successfulSegments polarity', () => {
  it('treats true as the failed segment, matching servicedesk 186', () => {
    const decoded = decodeLedgerSuccessfulSegments({
      type: 'partialSuccess',
      successfulSegments: new Map([[0, false], [3, true]]),
    });
    expect(decoded.failedSegmentIds).toEqual([3]);
    expect(decoded.polarity).toBe('ledger-successfulSegments-true-means-failed');
    expect(decoded.upstream).toMatch(/issues\/186/);
    expect(decoded.official).toMatch(/TransactionResult/);
    expect(builderCredit).toMatch(/kshot9000@gmail.com/);
  });

  it('does not invent a ledger fix or rewrite indexer segment success', () => {
    const check = checkSegmentPolarity();
    expect(check.ok).toBe(true);
    expect(check.failures).toEqual([]);
  });
});
