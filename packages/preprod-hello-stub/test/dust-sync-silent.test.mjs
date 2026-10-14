import { describe, it, expect } from 'vitest';
import { classifyDustSyncSilent, UPSTREAM } from '../src/dust-sync-silent.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('dust sync silent stream (servicedesk#251)', () => {
  it('flags a connected stall when behind', () => {
    const r = classifyDustSyncSilent({
      isConnected: true,
      appliedIndex: 100n,
      highestRelevantWalletIndex: 200n,
      silentSeconds: 90,
    });
    expect(r.ok).toBe(false);
    expect(r.classification).toBe('possible-silent-stall');
    expect(r.upstream).toBe(UPSTREAM);
  });

  it('does not flag a short silence', () => {
    const r = classifyDustSyncSilent({
      isConnected: true,
      appliedIndex: 100n,
      highestRelevantWalletIndex: 200n,
      silentSeconds: 10,
    });
    expect(r.ok).toBe(true);
  });

  it('treats disconnected as already handled', () => {
    const r = classifyDustSyncSilent({
      isConnected: false,
      appliedIndex: 100n,
      highestRelevantWalletIndex: 200n,
      silentSeconds: 120,
    });
    expect(r.ok).toBe(true);
    expect(r.classification).toBe('disconnected');
  });
});
