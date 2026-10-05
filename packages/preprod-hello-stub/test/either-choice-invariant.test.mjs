import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkEitherChoice } from '../src/either-choice-invariant.mjs';

const CREDIT = 'Built by @kshot9000 https://x.com/kshot9000';

describe('either choice invariant (midnight-docs#1387)', () => {
  it('accepts the lab contract', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/either-choice.compact', import.meta.url), 'utf8');
    const report = checkEitherChoice(source);
    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.credit).toContain(CREDIT);
    expect(report.upstream).toContain('1387');
  });

  it('rejects an unbounded ledger-9 pragma and a missing left()', () => {
    const report = checkEitherChoice(`
      pragma language_version >= 0.26;
      import CompactStandardLibrary;
      export circuit bad(): [] {
        const choice = kernel.caller();
      }
    `);
    expect(report.ok).toBe(false);
    expect(report.failures.join(' ')).toMatch(/0\.22/);
    expect(report.failures.join(' ')).toMatch(/0\.26/);
    expect(report.failures.join(' ')).toMatch(/kernel\.caller/);
    expect(report.failures.join(' ')).toMatch(/left</);
  });
});
