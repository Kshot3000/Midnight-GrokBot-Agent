import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEitherPageDrift, classifyEitherPageDrift } from '../src/either-page-drift.mjs';

const CREDIT = 'Built by @kshot9000 https://x.com/kshot9000';

test('either page drift keeps the 0.31.1 contract on isLeft (midnight-docs#1387)', () => {
  const source = readFileSync(new URL('../../../contracts/hello-midnight/either-choice.compact', import.meta.url), 'utf8');
  const report = classifyEitherPageDrift(source);
  assert.equal(report.kind, 'public-pin-spelling');
  assert.equal(report.pinField, 'isLeft');
  assert.equal(report.pageField, 'is_left');
  const check = checkEitherPageDrift();
  assert.equal(check.ok, true);
  assert.match(check.credit, new RegExp(CREDIT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(check.pageRead, '2026-10-09');
  assert.match(check.upstream, /1387/);
});
