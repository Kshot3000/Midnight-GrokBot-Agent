import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import { STORAGE_KEY } from '../ballot-core.mjs';

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
    saveStudioState(
      {
        ballots: [{ id: 'b1', question: 'Ship?', options: ['Yes', 'No'] }],
        votes: [],
        rejectCount: 0,
        activeId: 'b1',
        vault: { b1: { eligSalt: 'abc' } },
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.ballots[0].question).toBe('Ship?');
    expect(loaded.vault.b1.eligSalt).toBe('abc');
    expect(loaded.schemaVersion).toBe(2);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).ballots).toEqual([]);
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      ballots: [{ id: 'x', question: 'Q', options: ['A', 'B'] }],
      votes: [{ id: 'v', ballotId: 'x', nullifier: 'n', choiceLabel: 'A' }],
      activeId: 'x',
      vault: {},
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.votes).toHaveLength(1);
  });
});
