import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodePureInterface, scanPureInContractType } from '../src/pure-interface-invariant.mjs';

test('detects PureInterfaceCircuit', () => {
  const r = decodePureInterface('ModuleResolutionError: kind PureInterfaceCircuit');
  assert.equal(r.ok, true);
  assert.match(r.hint, /pure/i);
});

test('ignores other kinds', () => {
  const r = decodePureInterface('ModuleResolutionError: kind OperationAbsent');
  assert.equal(r.ok, false);
});

test('flags pure circuit inside a contract type', () => {
  const r = scanPureInContractType('contract type Foo { pure circuit bar(): []; }');
  assert.equal(r.ok, false);
  assert.match(r.hint, /PureInterfaceCircuit|servicedesk#249/i);
});

test('allows local pure helper outside a contract type', () => {
  const r = scanPureInContractType('export pure circuit helper(): [] { return; } export circuit bump(): [] {}');
  assert.equal(r.ok, true);
});
