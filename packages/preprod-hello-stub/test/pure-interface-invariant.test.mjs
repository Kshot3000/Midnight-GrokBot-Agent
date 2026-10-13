import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodePureInterface } from '../src/pure-interface-invariant.mjs';

test('detects PureInterfaceCircuit', () => {
  const r = decodePureInterface('ModuleResolutionError: kind PureInterfaceCircuit');
  assert.equal(r.ok, true);
  assert.match(r.hint, /pure/i);
});

test('ignores other kinds', () => {
  const r = decodePureInterface('ModuleResolutionError: kind OperationAbsent');
  assert.equal(r.ok, false);
});
