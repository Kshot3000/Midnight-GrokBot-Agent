import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { scanAssertVerify } from '../src/assert-verify-invariant.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(here, '../../../contracts/hello-midnight/assert-verify.compact'), 'utf8');

test('sample asserts both official verify circuits', () => {
  const result = scanAssertVerify(sample);
  assert.equal(result.ok, true);
  assert.equal(result.kind, 'verify-asserted');
  assert.equal(result.upstream.includes('midnight-docs/issues/1387'), true);
  assert.equal(result.official.includes('docs.midnight.network/compact/standard-library/exports'), true);
});

test('a bare verify call is not an enforcement', () => {
  const source = `
    export circuit loose(msg: Bytes<32>, sig: Ed25519Signature, pk: Curve25519Point): Boolean {
      return ed25519Verify(msg, sig, pk);
    }
  `;
  const result = scanAssertVerify(source);
  assert.equal(result.ok, false);
  assert.equal(result.missing[0].call, 'ed25519Verify');
  assert.match(result.message, /assert the result is true/);
});

test('assert of an assigned verify result counts', () => {
  const source = `
    export circuit held(msg: Vector<1, Field>, signature: JubjubSchnorrSignature, pk: JubjubPoint): [] {
      const ok = jubjubSchnorrVerify(msg, signature, pk);
      assert(ok, "rejected");
    }
  `;
  assert.equal(scanAssertVerify(source).ok, true);
});
