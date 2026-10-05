import { describe, expect, it } from 'vitest';
import { classifyIndexerTipLag, indexerTipLagCredit } from '../src/indexer-tip-lag.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyIndexerTipLag', () => {
  it('explains a missing output when the public indexer already has the tx', () => {
    const result = classifyIndexerTipLag({
      publicTip: 2825871,
      walletIndexerTip: 2797947,
      publicIndexerTip: 2821114,
      txBlock: 2821114,
    });
    expect(result.ok).toBe(false);
    expect(result.classification).toBe('wallet-indexer-behind-public-confirmation');
    expect(result.walletLagBlocks).toBe(27924);
    expect(result.hint).toMatch(/servicedesk#230/);
    expect(result.hint).toMatch(/not a failed prove/);
    expect(result.upstream).toBe('https://github.com/midnightntwrk/servicedesk/issues/230');
    expect(result.publicIndexer).toBe('https://indexer.preprod.midnight.network/api/v4/graphql');
  });

  it('does not call a stall when the wallet tip already covers the tx block', () => {
    const result = classifyIndexerTipLag({
      publicTip: 100,
      walletIndexerTip: 100,
      publicIndexerTip: 100,
      txBlock: 90,
    });
    expect(result.ok).toBe(true);
    expect(result.classification).toBe('aligned');
  });

  it('refuses incomplete heights instead of inventing a query', () => {
    const result = classifyIndexerTipLag({ publicTip: 10 });
    expect(result.classification).toBe('incomplete');
    expect(result.hint).toMatch(/does not call the indexer/);
  });

  it('keeps the lab credit block', () => {
    expect(indexerTipLagCredit).toContain('Email: kshot9000@gmail.com');
    expect(indexerTipLagCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
