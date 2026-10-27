import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { checkDisclosureSites266 } from '../src/disclosure-sites-266-invariant.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compactPath = join(__dirname, '../../../contracts/hello-midnight/disclosure-sites-266.compact');
const source = readFileSync(compactPath, 'utf8');

describe('disclosure-sites-266 invariant', () => {
  it('matches the patterns from servicedesk#266', () => {
    const result = checkDisclosureSites266(source);
    expect(result.ok).toBe(true);
    expect(result.checks.returnArgNoDisclose).toBe(true);
    expect(result.checks.returnWitnessDisclose).toBe(true);
    expect(result.checks.assertSecretNoDisclose).toBe(true);
    expect(result.checks.mapKeyDisclose).toBe(true);
    expect(result.checks.branchDisclose).toBe(true);
    expect(result.checks.storeDisclose).toBe(true);
    expect(result.checks.languagePin).toBe(true);
  });
});
