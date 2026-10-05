import { describe, expect, it } from 'vitest';
import { assessDeployCircuitBudget, listExportedCircuits } from '../src/deploy-circuit-budget.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const small = `
pragma language_version >= 0.23;
import CompactStandardLibrary;
export ledger counter: Counter;
// export circuit ignored(): [] { counter.increment(1); }
export circuit increment(): [] { counter.increment(1); }
circuit helper(): [] { counter.increment(1); }
`;

function many(n) {
  const lines = ['pragma language_version >= 0.23;', 'import CompactStandardLibrary;', 'export ledger counter: Counter;'];
  for (let i = 1; i <= n; i += 1) lines.push(`export circuit c${i}(): [] { counter.increment(1); }`);
  return lines.join('\n');
}

describe('deploy circuit budget', () => {
  it('ignores comments and non-exported circuits', () => {
    expect(listExportedCircuits(small)).toEqual(['increment']);
  });

  it('does not flag a small hello-style contract', () => {
    const result = assessDeployCircuitBudget(small);
    expect(result.ok).toBe(true);
    expect(result.count).toBe(1);
    expect(result.upstream).toContain('servicedesk/issues/226');
  });

  it('flags the reported 15-circuit deploy observation without inventing an API', () => {
    const result = assessDeployCircuitBudget(many(15));
    expect(result.ok).toBe(false);
    expect(result.count).toBe(15);
    expect(result.hint).toContain('does not invent a subset-deploy option');
    expect(result.hint).toContain('154');
    expect(result.docs).toContain('decode-1010-transaction-rejection-errors');
  });
});
