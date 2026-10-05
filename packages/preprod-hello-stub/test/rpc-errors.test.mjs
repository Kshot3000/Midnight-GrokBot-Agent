import { describe, expect, it } from 'vitest';
import { decodeMidnightRpcError, lookupLedgerCustomError, builderCredit } from '../src/rpc-errors.mjs';

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


  it('maps documented Custom error: 196 from a wrapped FiberFailure', () => {
    const causeId = Symbol.for('effect/FiberFailure/Cause');
    const rpc = { name: 'RpcError', message: '1010: Invalid Transaction: Custom error: 196' };
    const inner = { name: 'SubmissionError', message: 'Transaction submission failed', cause: rpc };
    const err = new Error('Transaction submission error');
    err.name = '(FiberFailure) SubmissionError';
    err.cause = undefined;
    err[causeId] = inner;
    const decoded = decodeMidnightRpcError(err);
    expect(decoded.ledgerCode).toBe(196);
    expect(decoded.title).toMatch(/DustDoubleSpend/);
    expect(decoded.docs).toBe('https://docs.midnight.network/nodes/error-codes');
    expect(decoded.upstream).toMatch(/225/);
  });

  it('names ledger 154 when Custom error is present and leaves unknown codes unnamed', () => {
    expect(lookupLedgerCustomError(154).name).toBe('BlockLimitExceededError');
    const unknown = decodeMidnightRpcError('1010: Invalid Transaction: Custom error: 142');
    expect(unknown.ledgerCode).toBe(142);
    expect(unknown.title).toMatch(/custom error 142/);
    const huge = decodeMidnightRpcError('Custom error: 10101');
    expect(huge.ledgerCode).toBe(null);
    expect(huge.title).toMatch(/not a ledger u8/);
  });
  it('does not invent a name for submission-layer code 10999', () => {
    const decoded = decodeMidnightRpcError('Transaction submission error (code: 10999)');
    expect(decoded.code).toBe(10999);
    expect(decoded.ledgerCode).toBe(null);
    expect(decoded.title).toMatch(/not a ledger u8/);
    expect(decoded.title).not.toMatch(/Dust|Zswap|FeeCalculation/);
    expect(decoded.upstream).toMatch(/midnight-docs\/issues\/1385/);
    expect(decoded.docs).toBe('https://docs.midnight.network/nodes/error-codes');
  });

  it('names documented fee variants 155 and 231', () => {
    expect(lookupLedgerCustomError(155).name).toBe('FeeCalculationError');
    const outside = decodeMidnightRpcError('1010: Invalid Transaction: Custom error: 231');
    expect(outside.ledgerCode).toBe(231);
    expect(outside.title).toMatch(/OutsideTimeToDismiss/);
    expect(outside.hint).toMatch(/servicedesk\/issues\/117/);
  });

  it('keeps the lab credit block', () => {

    expect(builderCredit).toContain('Email: kshot9000@gmail.com');
    expect(builderCredit).toContain('Built by @kshot9000 https://x.com/kshot9000');
  });
});
