import { describe, it, expect } from 'vitest';
import { readWalletCredentials } from '../src/require-wallet-env.mjs';
import { assembleProvidersWithoutWallet, applyPreprodNetwork } from '../src/providers.mjs';
import { PREPROD } from '../src/preprod-config.mjs';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

describe('preprod wallet gate', () => {
  it('reports MISSING when no env credentials', () => {
    const r = readWalletCredentials({});
    expect(r.ok).toBe(false);
    expect(r.code).toBe('MISSING');
  });

  it('rejects both seed and mnemonic', () => {
    const r = readWalletCredentials({
      MIDNIGHT_WALLET_SEED: '00'.repeat(32),
      MIDNIGHT_WALLET_MNEMONIC: 'abandon '.repeat(23) + 'about',
    });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('BOTH_SET');
  });

  it('accepts 64-byte hex seed', () => {
    const r = readWalletCredentials({ MIDNIGHT_WALLET_SEED: 'ab'.repeat(64) });
    expect(r.ok).toBe(true);
    expect(r.kind).toBe('seed');
    expect(r.seed).toHaveLength(128);
  });
});

describe('preprod providers wiring', () => {
  it('sets network id to preprod', () => {
    applyPreprodNetwork();
    expect(getNetworkId()).toBe('preprod');
  });

  it('assembles partial providers with null wallet slots', () => {
    const a = assembleProvidersWithoutWallet();
    expect(a.providers.publicDataProvider).toBeTruthy();
    expect(a.providers.zkConfigProvider).toBeTruthy();
    expect(a.providers.proofProvider).toBeTruthy();
    expect(a.providers.walletProvider).toBeNull();
    expect(a.providers.midnightProvider).toBeNull();
    expect(a.endpoints.indexer).toBe(PREPROD.indexer);
    expect(a.missingForDeploy.length).toBeGreaterThan(0);
  });
});
