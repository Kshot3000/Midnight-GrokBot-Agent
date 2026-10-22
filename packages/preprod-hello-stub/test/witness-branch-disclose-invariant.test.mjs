import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkWitnessBranchDisclose } from '../src/witness-branch-disclose-invariant.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const sample = readFileSync(join(here, '../../../contracts/hello-midnight/witness-branch-disclose.compact'), 'utf8');

test('sample discloses witness before ledger-writing branch', () => {
  const result = checkWitnessBranchDisclose(sample);
  assert.equal(result.ok, true);
  assert.equal(result.kind, 'witness-branch-disclosed');
  assert.equal(result.upstream.includes('servicedesk/issues/266'), true);
  assert.equal(result.official.includes('docs.midnight.network/compact/reference/explicit-disclosure'), true);
  assert.match(result.credit, /@kshot9000/);
});

test('direct branch on secretNum() is rejected form', () => {
  const bad = `
    pragma language_version >= 0.23;
    import CompactStandardLibrary;
    export ledger val: Uint<64>;
    witness secretNum(): Uint<64>;
    export circuit f(): [] {
      if (secretNum() > 5) {
        val = 1;
      } else {
        val = 2;
      }
    }
  `;
  const result = checkWitnessBranchDisclose(bad);
  assert.equal(result.ok, false);
  assert.match(result.message, /direct branch on secretNum/);
});

test('missing disclose assign fails', () => {
  const incomplete = `
    pragma language_version >= 0.23;
    import CompactStandardLibrary;
    export ledger val: Uint<64>;
    witness secretNum(): Uint<64>;
    export circuit f(): [] {
      const n = secretNum();
      if (n > 5) { val = 1; } else { val = 2; }
    }
  `;
  assert.equal(checkWitnessBranchDisclose(incomplete).ok, false);
});
