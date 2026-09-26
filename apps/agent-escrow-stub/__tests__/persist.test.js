import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import { STORAGE_KEY, freshEscrow, applyAction } from '../escrow-core.mjs';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

describe('persist', () => {
  /** @type {ReturnType<typeof memoryStorage>} */
  let store;

  beforeEach(() => {
    store = memoryStorage();
  });

  it('save/load/clear round-trip', () => {
    const escrow = applyAction(freshEscrow(), 'fund').escrow;
    saveStudioState({ escrow, activeRole: 'client' }, STORAGE_KEY, store);
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.escrow.state).toBe('funded');
    expect(loaded.schemaVersion).toBe(2);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).escrow.state).toBe('created');
  });

  it('export then import', () => {
    const escrow = applyAction(freshEscrow(), 'fund').escrow;
    const json = exportStudioJSON({ escrow, activeRole: 'approver' });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.activeRole).toBe('approver');
    expect(result.state.escrow.funded).toBeGreaterThan(0);
  });
});
