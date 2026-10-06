import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { classifyEitherField } from '../src/either-field-split.mjs';

const CREDIT = 'Built by @kshot9000 https://x.com/kshot9000';

describe('either field split (midnight-docs#1387 / compact#833)', () => {
  it('keeps the lab 0.31.1 contract on published isLeft', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/either-choice.compact', import.meta.url), 'utf8');
    const report = classifyEitherField(source);
    expect(report.ok).toBe(true);
    expect(report.pin).toBe('compact-0.31.1');
    expect(report.field).toBe('isLeft');
    expect(report.credit).toContain(CREDIT);
    expect(report.upstream).toContain('1387');
    expect(report.compactIssue).toContain('833');
  });

  it('accepts the compact#833 0.35 example spelling', () => {
    const report = classifyEitherField(`
      pragma language_version 0.27;
      import CompactStandardLibrary;
      export pure circuit leftOrZero(e: Either<Uint<32>, Bytes<32>>): Uint<32> {
        return e.is_left ? e.left : 0;
      }
    `);
    expect(report.ok).toBe(true);
    expect(report.field).toBe('is_left');
    expect(report.pin).toBe('compact-0.35.0-example');
  });

  it('rejects copying is_left onto the public-network pin', () => {
    const report = classifyEitherField(`
      pragma language_version >= 0.22 && <= 0.23;
      import CompactStandardLibrary;
      export circuit store(e: Either<Uint<64>, Uint<64>>): [] {
        assert(e.is_left, "tag");
      }
    `);
    expect(report.ok).toBe(false);
    expect(report.failures.join(' ')).toMatch(/is_left/);
    expect(report.failures.join(' ')).toMatch(/0\.31\.1/);
  });
});
