import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSemVer, semverSatisfies } from '../dist/semver.js';

describe('parseSemVer', () => {
  it('parses plain and v-prefixed', () => {
    assert.deepEqual(parseSemVer('4.0.1'), { major: 4, minor: 0, patch: 1 });
    assert.deepEqual(parseSemVer('v3.2.0'), { major: 3, minor: 2, patch: 0 });
  });
  it('returns null for garbage', () => {
    assert.equal(parseSemVer('nope'), null);
    assert.equal(parseSemVer(''), null);
  });
});

describe('semverSatisfies', () => {
  it('caret same major', () => {
    assert.equal(semverSatisfies('4.0.1', '^4.0.0'), true);
    assert.equal(semverSatisfies('4.9.0', '^4.0.0'), true);
    assert.equal(semverSatisfies('5.0.0', '^4.0.0'), false);
    assert.equal(semverSatisfies('3.9.9', '^4.0.0'), false);
  });
  it('exact match', () => {
    assert.equal(semverSatisfies('4.0.1', '4.0.1'), true);
    assert.equal(semverSatisfies('4.0.0', '4.0.1'), false);
  });
});
