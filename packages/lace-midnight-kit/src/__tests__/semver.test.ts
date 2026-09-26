import { describe, expect, it } from 'vitest';
import { parseSemVer, semverSatisfies } from '../semver.js';

describe('semver', () => {
  it('parses 4.0.1', () => {
    expect(parseSemVer('4.0.1')).toEqual({ major: 4, minor: 0, patch: 1 });
  });

  it('satisfies caret ^4.0.0', () => {
    expect(semverSatisfies('4.0.1', '^4.0.0')).toBe(true);
    expect(semverSatisfies('3.9.0', '^4.0.0')).toBe(false);
    expect(semverSatisfies('5.0.0', '^4.0.0')).toBe(false);
  });
});
