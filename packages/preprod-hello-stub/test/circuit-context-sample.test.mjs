/**
 * Unit tests for the test-and-debug sample checker.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  checkCircuitContextSample,
  OFFICIAL_ASSERT_MESSAGES,
} from '../src/circuit-context-sample.mjs';

const STALE = `
const context = { privateState, ledgerState: { round: 0n } };
const result = contract.impureCircuits.increment(context);
expect(result.newLedgerState.round).toBe(1n);
expect(() => contract.impureCircuits.post(result.newContext, 'World')).toThrow('Board is occupied');
expect(() => contract.impureCircuits.takeDown(context)).toThrow('Board is vacant');
expect(() => contract.impureCircuits.takeDown(context)).toThrow('Not authorized');
`;

const CURRENT = `
import * as RT from '@midnight-ntwrk/compact-runtime';
const ctor = contract.initialState(RT.createConstructorContext({ secretKey }, COIN));
const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey });
const call = contract.impureCircuits.post(ctx, 'Hello from Compact!');
expect(call.result).toEqual([]);
expect(call.proofData.publicTranscript.length).toBeGreaterThan(0);
expect(call.gasCost).toBeDefined();
const board = ledger(call.context.currentQueryContext.state);
expect(board.state).toBe(State.OCCUPIED);
expect(() => contract.impureCircuits.post(occupied, 'Second')).toThrow(
  '${OFFICIAL_ASSERT_MESSAGES.occupied}',
);
`;

describe('circuit context sample (midnight-docs#1487)', () => {
  it('rejects the hand-built context and stale assert strings', () => {
    const report = checkCircuitContextSample(STALE);
    assert.equal(report.ok, false);
    const joined = report.failures.join(' ');
    assert.match(joined, /CircuitContext/);
    assert.match(joined, /newLedgerState/);
    assert.match(joined, /occupied board/);
    assert.match(report.upstream, /1487/);
  });

  it('accepts the runtime-helper shape from the JavaScript guide', () => {
    const report = checkCircuitContextSample(CURRENT);
    assert.equal(report.ok, true);
    assert.deepEqual(report.failures, []);
    assert.deepEqual(report.resultKeys, ['result', 'context', 'proofData', 'gasCost']);
    assert.equal(report.pins.compactRuntime, '0.16.0');
    assert.match(report.credit, /kshot9000@gmail.com/);
  });
});
