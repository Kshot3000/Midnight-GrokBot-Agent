import { describe, expect, it } from 'vitest';
import { decodeMidnightRpcError, compareObservedHeads, warnSkippedIndexerEvents, builderCredit } from '../src/rpc-errors.mjs';

/**
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */

describe('decodeMidnightRpcError', () => {
  it('names RPC 1010 instead of a generic submission error', () => {
    const decoded = decodeMidnightRpcError('Transaction submission error: 1010 Transaction would exhaust the block limits');
    expect(decoded.code).toBe(1010);
    expect(decoded.title).toMatch(/block limits/);
    expect(decoded.upstream).toMatch(/225/);
  });

  it('reads RPC 1010 from an Effect FiberFailure symbol cause', () => {
    const causeId = Symbol.for('effect/FiberFailure/Cause');
    const rpc = { name: 'RpcError', message: '1010: Invalid Transaction: Transaction would exhaust the block limits' };
    const inner = { name: 'SubmissionError', message: 'Transaction submission failed', cause: rpc };
    const outer = { name: 'SubmissionError', message: 'Transaction submission error', cause: inner };
    const err = new Error('Transaction submission error');
    err.name = '(FiberFailure) SubmissionError';
    err.cause = undefined;
    err[causeId] = outer;
    const decoded = decodeMidnightRpcError(err);
    expect(decoded.code).toBe(1010);
    expect(decoded.raw).toMatch(/exhaust the block limits/);
    expect(decoded.upstream).toMatch(/servicedesk\/issues\/225/);
  });

  it('points a bare submission error at the open unwrap report', () => {
    const decoded = decodeMidnightRpcError({ message: 'Transaction submission error', cause: undefined });
    expect(decoded.code).toBe(null);
    expect(decoded.title).toMatch(/node reason hidden/);
    expect(decoded.upstream).toMatch(/225/);
  });

  it('points an indexer stall at the open Preprod report', () => {
    const decoded = decodeMidnightRpcError('indexer timeout: stalled behind node');
    expect(decoded.upstream).toMatch(/230/);
  });

  it('keeps the lab credit block', () => {
    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
