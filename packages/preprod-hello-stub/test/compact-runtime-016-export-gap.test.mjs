import { describe, it, expect } from 'vitest';
import { classifyRuntimeExportGap } from '../src/compact-runtime-016-export-gap.mjs';

describe('compact-runtime 0.16 export gap', () => {
  it('classifies missing Schnorr export', () => {
    const r = classifyRuntimeExportGap('Module has no exported member \'jubjubSchnorrSign\'');
    expect(r.kind).toBe('schnorr-not-in-016');
  });

  it('classifies version mismatch', () => {
    const r = classifyRuntimeExportGap('Version mismatch: compiled code expects 0.16.0, runtime is 0.20.0');
    expect(r.kind).toBe('runtime-version-mismatch');
  });
});
