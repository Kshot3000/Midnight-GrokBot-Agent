import { describe, expect, it } from 'vitest';
import {
  classifyWalletSdkReferenceGap,
  builderCredit,
  PUBLISHED_SAMPLE_CALLS,
  PUBLISHED_WALLET_PACKAGES,
  WALLET_SDK_REFERENCE,
} from '../src/wallet-sdk-reference.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('classifyWalletSdkReferenceGap', () => {
  it('points the original missing-page report at the published narrative page', () => {
    const decoded = classifyWalletSdkReferenceGap(
      'Missing Wallet SDK API reference at https://docs.midnight.network/api-reference',
    );
    expect(decoded.kind).toBe('page-now-published-index-still-open');
    expect(decoded.docs).toBe(WALLET_SDK_REFERENCE.walletPage);
    expect(decoded.generatedIndex).toBe(false);
    expect(decoded.matrixPin).toBe('1.2.0');
  });

  it('names the facade sample without inventing methods', () => {
    const decoded = classifyWalletSdkReferenceGap('WalletFacade.init from @midnight-ntwrk/wallet-sdk-facade');
    expect(decoded.kind).toBe('published-facade-sample');
    expect(decoded.hint).toMatch(/fetchTermsAndConditions/);
    expect(PUBLISHED_SAMPLE_CALLS).toContain('WalletFacade.init');
  });

  it('keeps the transfer chain to the published sample', () => {
    const decoded = classifyWalletSdkReferenceGap('transferTransaction then signRecipe then finalizeRecipe');
    expect(decoded.kind).toBe('published-transfer-sample');
    expect(decoded.hint).toMatch(/ledger-v8/);
  });

  it('does not treat the barrel as a documented entry point', () => {
    const decoded = classifyWalletSdkReferenceGap("Cannot find module '@midnight-ntwrk/wallet-sdk'");
    expect(decoded.kind).toBe('barrel-not-on-the-page');
    expect(PUBLISHED_WALLET_PACKAGES).toContain('@midnight-ntwrk/wallet-sdk-facade');
    expect(PUBLISHED_WALLET_PACKAGES).not.toContain('@midnight-ntwrk/wallet-sdk');
  });

  it('leaves unrelated submit errors alone', () => {
    const decoded = classifyWalletSdkReferenceGap('Transaction submission error: 1010 Invalid Transaction');
    expect(decoded.kind).toBe('not-a-wallet-sdk-reference-gap');
  });

  it('keeps the lab credit block', () => {
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v');
  });
});
