import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatAddress, formatInjectionKey } from '../dist/format.js';

describe('formatAddress', () => {
  it('placeholder for empty', () => {
    assert.equal(formatAddress(null), '(unavailable)');
    assert.equal(formatAddress(''), '(unavailable)');
  });
  it('middle truncates long values', () => {
    const long = 'abcdefghij0123456789XYZW';
    const out = formatAddress(long, { head: 6, tail: 4 });
    assert.equal(out, 'abcdef…XYZW');
  });
  it('keeps short values intact', () => {
    assert.equal(formatAddress('short'), 'short');
  });
});

describe('formatInjectionKey', () => {
  it('shortens UUID-like keys', () => {
    assert.equal(formatInjectionKey('abcdef12-3456-7890'), 'abcdef12…');
  });
  it('handles empty', () => {
    assert.equal(formatInjectionKey(''), '(none)');
  });
});
