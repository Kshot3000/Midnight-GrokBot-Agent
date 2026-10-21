import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyQuickstartCommand } from '../src/quickstart-scaffolder-gap.mjs';

test('flags create-mn-app as legacy', () => {
  const r = classifyQuickstartCommand('npx create-mn-app my-app');
  assert.equal(r.ok, false);
  assert.equal(r.kind, 'legacy-create-mn-app');
  assert.match(r.hint, /1587/);
});

test('refuses unpublished scaffolder', () => {
  const r = classifyQuickstartCommand('npx @midnight-ntwrk/midnight-examples');
  assert.equal(r.kind, 'unverified-new-scaffolder');
});
