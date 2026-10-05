import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkNoBitwise } from '../src/bitwise-gap-invariant.mjs';

const CREDIT = 'Built by @kshot9000 https://x.com/kshot9000';

describe('bitwise gap invariant (midnight-docs#1387)', () => {
  it('accepts the lab contract', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/no-bitwise.compact', import.meta.url), 'utf8');
    const report = checkNoBitwise(source);
    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
    expect(report.operatorsAbsent).toContain('<<');
    expect(report.credit).toContain(CREDIT);
    expect(report.upstream).toContain('1387');
  });

  it('rejects invented bitwise and shift operators', () => {
    const report = checkNoBitwise(`
      pragma language_version >= 0.22 && <= 0.23;
      import CompactStandardLibrary;
      export circuit bad(flag: Boolean): [] {
        const bit = flag & 1;
        const shifted = bit << 1;
      }
    `);
    expect(report.ok).toBe(false);
    expect(report.failures.join(' ')).toMatch(/bitwise/);
    expect(report.failures.join(' ')).toMatch(/shift/);
    expect(report.failures.join(' ')).toMatch(/ternary/);
  });

  it('does not treat && or || as bitwise', () => {
    const source = readFileSync(new URL('../../../contracts/hello-midnight/no-bitwise.compact', import.meta.url), 'utf8');
    const report = checkNoBitwise(source);
    expect(report.failures.join(' ')).not.toMatch(/bitwise/);
  });
});

// Built by @kshot9000 https://x.com/kshot9000
// Email: kshot9000@gmail.com
// Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
// Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
