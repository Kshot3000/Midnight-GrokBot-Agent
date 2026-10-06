import { describe, expect, it } from 'vitest';
import { classifyWalletSyncStall, builderCredit, WALLET_SYNC_DOCS } from '../src/wallet-sync-stall.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyWalletSyncStall', () => {
  it('names a non-linear dust commitment insert without inventing a recovery API', () => {
    const decoded = classifyWalletSyncStall(
      'wallet sync error values inserted non-linearly into dust commitment tree expected index received',
    );
    expect(decoded.kind).toBe('dust-commitment-nonlinear');
    expect(decoded.hint).toMatch(/does not document a recovery call/);
    expect(decoded.upstream).toBe(WALLET_SYNC_DOCS.upstream);
  });

  it('treats connected progress as not yet synced', () => {
    const decoded = classifyWalletSyncStall(
      'shielded progress.isConnected but FacadeState.isSynced never becomes true on Preprod',
    );
    expect(decoded.kind).toBe('connected-not-synced');
    expect(decoded.docs).toBe(WALLET_SYNC_DOCS.walletGuide);
  });

  it('points waitForSyncedState at the published gate and no duration', () => {
    const decoded = classifyWalletSyncStall('waitForSyncedState() on Preprod hangs after wallet creation');
    expect(decoded.kind).toBe('wait-for-synced-state');
    expect(decoded.hint).toMatch(/No expected Preprod duration/);
  });

  it('does not invent a checkpoint staleness bound', () => {
    const decoded = classifyWalletSyncStall('how stale can a checkpoint be before restore() stops working');
    expect(decoded.kind).toBe('checkpoint-staleness-unpublished');
    expect(decoded.hint).toMatch(/Do not invent one/);
  });

  it('leaves unrelated submit errors alone', () => {
    const decoded = classifyWalletSyncStall('Transaction submission error: 1010 Invalid Transaction');
    expect(decoded.kind).toBe('not-a-recorded-sync-stall');
  });

  it('keeps the lab credit block', () => {
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v');
  });
});
