/**
 * Pin check: 0.16.0 guide arity vs 0.19.0 API reference.
 * Upstream: https://github.com/midnightntwrk/midnight-docs/issues/1487
 *
 * Built by @kshot9000 https://x.com/kshot9000
 * Email: kshot9000@gmail.com
 * Cardano donation: addr1q8hnl6vl5a6k3rw3n5g3jtte696zcl76kfatzv7gpswa9r0dj7fma6klq55y4ffm7tf0em09udnyhuk4ah92pl5x9jpqjae44v
 * Teams: @midnightntwrk @MidnightNtwrk @midnightfdn @Cardano @InputOutputHK @cardano-foundation
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkRuntimeContextArity } from '../src/runtime-context-arity.mjs';

const GUIDE = `
import * as RT from '@midnight-ntwrk/compact-runtime';
const ctor = contract.initialState(RT.createConstructorContext({ secretKey }, COIN));
const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, { secretKey });
const call = contract.impureCircuits.post(ctx, 'Hello from Compact!');
`;

const API_REF = `
const ctx = RT.createCircuitContext('post', ADDR, coinOrZswap, contractState, { secretKey });
const call = await contract.impureCircuits.post(ctx, 'Hello');
`;

describe('runtime context arity (midnight-docs#1487)', () => {
  it('accepts the 0.16.0 guide form used with midnight-js 4.1.1', () => {
    const report = checkRuntimeContextArity(GUIDE);
    assert.equal(report.ok, true);
    assert.equal(report.shape, 'guide-0.16.0');
    assert.equal(report.pins.compactRuntime, '0.16.0');
    assert.equal(report.pins.midnightJs, '4.1.1');
    assert.match(report.upstream, /1487/);
    assert.match(report.credit, /kshot9000@gmail.com/);
  });

  it('rejects the 0.19.0 circuit-id-first form and awaited circuit calls', () => {
    const report = checkRuntimeContextArity(API_REF);
    assert.equal(report.ok, false);
    assert.equal(report.shape, 'api-reference-0.19.0');
    const joined = report.failures.join(' ');
    assert.match(joined, /0\.19\.0/);
    assert.match(joined, /promises/);
  });
});
