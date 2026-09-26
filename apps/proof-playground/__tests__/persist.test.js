import { describe, expect, it, beforeEach } from 'vitest';
import {
  loadStudioState,
  saveStudioState,
  clearStudioState,
  exportStudioJSON,
  importStudioJSON,
} from '../persist.mjs';
import { STORAGE_KEY, SCHEMA_VERSION } from '../proof-core.mjs';

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
        history: [{ id: '1', circuitId: 'range', name: 'R', blob: 'b', verified: true, at: 't', note: 'n' }],
        activeId: 'sum',
        presets: {},
      },
      STORAGE_KEY,
      store,
    );
    const loaded = loadStudioState(STORAGE_KEY, store);
    expect(loaded.activeId).toBe('sum');
    expect(loaded.history).toHaveLength(1);
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION);
    clearStudioState(STORAGE_KEY, store);
    expect(loadStudioState(STORAGE_KEY, store).history).toHaveLength(0);
  });

  it('export then import', () => {
    const json = exportStudioJSON({
      history: [{ id: '1', circuitId: 'range', name: 'R', blob: 'b', verified: false, at: 't', note: '' }],
      activeId: 'range',
      presets: { range: { circuitId: 'range', witnesses: { x: 1 }, label: 'p' } },
    });
    const result = importStudioJSON(json);
    expect(result.ok).toBe(true);
    expect(result.state.presets.range.witnesses.x).toBe(1);
  });
});
