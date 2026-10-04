import { describe, expect, it } from 'vitest';
import { featureDetectOptionalMethods } from '../capabilities.js';

describe('featureDetectOptionalMethods', () => {
  it('marks Lace-shaped APIs as missing proving and signData without calling them', () => {
    const called = { proving: 0, sign: 0 };
    const api = {
      getProvingProvider: undefined,
      signData: undefined,
    };
    const rows = featureDetectOptionalMethods(api);
    expect(rows.map((r) => r.status)).toEqual(['unavailable', 'unavailable']);
    expect(rows[0]!.detail).toContain('localhost:6300');
    expect(called.proving).toBe(0);
    expect(called.sign).toBe(0);
  });

  it('reports present methods as ok and does not invoke them', () => {
    let calls = 0;
    const api = {
      getProvingProvider: () => {
        calls += 1;
        return {};
      },
      signData: () => {
        calls += 1;
      },
    };
    const rows = featureDetectOptionalMethods(api);
    expect(rows.every((r) => r.status === 'ok')).toBe(true);
    expect(calls).toBe(0);
  });
});
