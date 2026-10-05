import { describe, expect, it } from 'vitest';
import { decodeMidnightRpcError, compareObservedHeads, warnSkippedIndexerEvents } from '../src/rpc-errors.mjs';

describe('decodeMidnightRpcError', () => {
  it('names RPC 1010 instead of a generic submission error', () => {
    const decoded = decodeMidnightRpcError('Transaction submission error: 1010 Transaction would exhaust the block limits');
    expect(decoded.code).toBe(1010);
    expect(decoded.title).toMatch(/block limits/);
    expect(decoded.upstream).toMatch(/225/);
  });

  it('points an indexer stall at the open Preprod report', () => {
    const decoded = decodeMidnightRpcError('indexer timeout: stalled behind node');
    expect(decoded.upstream).toMatch(/230/);
  });
});
