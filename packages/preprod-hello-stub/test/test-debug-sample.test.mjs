import { describe, expect, it } from 'vitest';
import {
  inspectCircuitContext,
  inspectCircuitResults,
  inspectTestDebugSample,
} from '../src/test-debug-sample.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

const PAGE_SAMPLE = `
const context = {
  privateState,
  ledgerState: { round: 0n }
};
const result = contract.impureCircuits.increment(context);
expect(result.newLedgerState.round).toBe(1n);
const= contract.impureCircuits.increment(currentContext);
const receipt = await tx.wait();
expect(receipt.status).toBe('APPLIED_TO_CHAIN');
expect(() => contract.impureCircuits.takeDown(vacantContext)).toThrow('Board is vacant');
`;

describe('test-and-debug sample gap', () => {
  it('flags the published page sample against the runtime guide', () => {
    const result = inspectTestDebugSample(PAGE_SAMPLE);
    expect(result.ok).toBe(false);
    expect(result.upstream).toMatch(/midnight-docs\/issues\/1487/);
    expect(result.failures.join(' ')).toMatch(/ledgerState/);
    expect(result.failures.join(' ')).toMatch(/newLedgerState/);
    expect(result.failures.join(' ')).toMatch(/const=/);
    expect(result.failures.join(' ')).toMatch(/APPLIED_TO_CHAIN/);
    expect(result.failures.join(' ')).toMatch(/Board is vacant/);
  });

  it('accepts a runtime-guide context and CircuitResults shape', () => {
    const context = inspectCircuitContext({
      currentQueryContext: { state: {} },
      currentPrivateState: { secretKey: new Uint8Array(32) },
    });
    expect(context.ok).toBe(true);
    const call = inspectCircuitResults({
      result: [],
      context: {},
      proofData: {},
      gasCost: {},
    });
    expect(call.ok).toBe(true);
  });

  it('rejects the hand-built context the test page uses', () => {
    const context = inspectCircuitContext({
      privateState: { privateCounter: 0 },
      ledgerState: { round: 0n },
    });
    expect(context.ok).toBe(false);
    expect(context.failures.join(' ')).toMatch(/currentQueryContext/);
  });
});
