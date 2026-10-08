import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkSealedDeadlineSource } from '../src/sealed-deadline-invariant.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const source = readFileSync(
  new URL('../../../contracts/hello-midnight/sealed-deadline.compact', import.meta.url),
  'utf8',
);

describe('sealed deadline invariant', () => {
  it('seals the cutoff and gates claim with blockTimeLt', () => {
    const result = checkSealedDeadlineSource(source);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1387/);
    expect(result.official).toMatch(/security-best-practices/);
  });

  it('flags a circuit rewrite of deadline and a raw blockTime call', () => {
    const bad = [
      'pragma language_version 0.23;',
      'export sealed ledger deadline: Uint<64>;',
      'export ledger claimed: Boolean;',
      'constructor(deadlineTime: Uint<64>) { deadline = disclose(deadlineTime); claimed = false; }',
      'export circuit claim(): [] {',
      '  deadline = blockTime();',
      '  claimed = true;',
      '}',
    ].join('\n');
    const result = checkSealedDeadlineSource(bad);
    expect(result.ok).toBe(false);
    expect(result.failures.join(' ')).toMatch(/blockTimeLt/);
    expect(result.failures.join(' ')).toMatch(/outside the constructor/);
    expect(result.failures.join(' ')).toMatch(/raw block-time/);
  });
});
