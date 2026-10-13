import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeRuntimeMismatch } from '../src/runtime-mismatch-decode.mjs';

test('detects coinPublicKey undefined',
  () => {
    const r = decodeRuntimeMismatch(
      "TypeError: Cannot read properties of undefined (reading 'coinPublicKey')",
    );
    assert.equal(r.ok, true);
    assert.equal(r.kind, 'coinPublicKey-undefined');
    assert.match(r.hint, /servicedesk#236/i);
  });

test('detects ContractMaintenanceAuthority',
  () => {
    const r = decodeRuntimeMismatch('Error: expected instance of ContractMaintenanceAuthority');
    assert.equal(r.ok, true);
    assert.equal(r.kind, 'maintenance-authority');
  });

test('ignores unrelated errors',
  () => {
    const r = decodeRuntimeMismatch('Failed Proof Server response');
    assert.equal(r.ok, false);
  });
