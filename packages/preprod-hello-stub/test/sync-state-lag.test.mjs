import { describe, expect, it } from 'vitest';
import { parseSyncState, summarizeSyncStateSamples, builderCredit } from '../src/sync-state-lag.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('preprod system_syncState false-synced lag', () => {
  it('parses hex and decimal sync heights', () => {
    expect(parseSyncState({ currentBlock: '0x2ac993', highestBlock: '0x2ac993' })).toEqual({
      currentBlock: 0x2ac993,
      highestBlock: 0x2ac993,
    });
    expect(parseSyncState({ result: { currentBlock: '2804284', highestBlock: '2804284' } }).currentBlock).toBe(2804284);
  });

  it('flags the 12:19 UTC shape from servicedesk 223', () => {
    const summary = summarizeSyncStateSamples([
      { currentBlock: 2804289, highestBlock: 2804291 },
      { currentBlock: 2804291, highestBlock: 2804291 },
      { currentBlock: 2804284, highestBlock: 2804284 },
      { currentBlock: 2804291, highestBlock: 2804291 },
    ]);
    expect(summary.falseSynced).toBe(1);
    expect(summary.largestLag).toBe(7);
    expect(summary.rows[2].falseSyncedBelowPrior).toBe(true);
    expect(summary.rows[1].falseSyncedBelowPrior).toBe(false);
    expect(summary.upstream).toMatch(/issues\/223/);
    expect(builderCredit).toMatch(/kshot9000@gmail.com/);
  });

  it('does not treat a still-catching-up node as false-synced', () => {
    const summary = summarizeSyncStateSamples([
      { currentBlock: 2804289, highestBlock: 2804291 },
      { currentBlock: 2804290, highestBlock: 2804291 },
    ]);
    expect(summary.falseSynced).toBe(0);
  });
});
