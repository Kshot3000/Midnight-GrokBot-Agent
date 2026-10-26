import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyPreprodWalletSyncStall } from '../src/preprod-wallet-sync-stall.mjs';

test('classifies silent dust subscription', () => {
  assert.equal(
    classifyPreprodWalletSyncStall({
      isConnected: true,
      appliedIndex: 10,
      highestRelevantWalletIndex: 42,
    }),
    'silent-dust-subscription',
  );
});

test('classifies nonlinear tree error', () => {
  assert.equal(
    classifyPreprodWalletSyncStall({ error: 'values inserted non-linearly into dust commitment tree expected index' }),
    'dust-tree-nonlinear',
  );
});

test('classifies never starts', () => {
  assert.equal(classifyPreprodWalletSyncStall({ isSynced: false, isConnected: false }), 'sync-never-starts');
});

test('unknown otherwise', () => {
  assert.equal(classifyPreprodWalletSyncStall({ isSynced: true }), 'unknown');
});
