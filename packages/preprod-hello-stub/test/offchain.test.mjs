import { describe, it, expect, beforeAll } from 'vitest';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { HELLO_CONTRACT, HELLO_KEYS } from '../src/paths.mjs';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { PREPROD } from '../src/preprod-config.mjs';

beforeAll(() => {
  if (!fs.existsSync(HELLO_CONTRACT)) {
    throw new Error(
      `Missing ${HELLO_CONTRACT} — run: npm run compact:hello (from repo root)`,
    );
  }
});

describe('preprod-hello-stub (honest off-chain)', () => {
  it('loads Compact-generated Contract and increments greetings', async () => {
    const { Contract, ledger } = await import(pathToFileURL(HELLO_CONTRACT).href);
    const contract = new Contract({});
    const COIN = '0'.repeat(64);
    const ADDR = RT.sampleContractAddress();
    const ctor = contract.initialState(RT.createConstructorContext({}, COIN));
    const ctx = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, {});
    expect(ledger(ctx.currentQueryContext.state).greetings).toBe(0n);
    const call = contract.impureCircuits.increment(ctx);
    expect(ledger(call.context.currentQueryContext.state).greetings).toBe(1n);
    expect(call.proofData.publicTranscript.length).toBeGreaterThan(0);
  });

  it('rejects missing witnesses shape only when required (hello needs none)', async () => {
    const { Contract } = await import(pathToFileURL(HELLO_CONTRACT).href);
    expect(() => new Contract({})).not.toThrow();
  });

  it('has real prover/verifier keys on disk (not placeholders)', () => {
    const prover = `${HELLO_KEYS}/increment.prover`;
    const verifier = `${HELLO_KEYS}/increment.verifier`;
    expect(fs.existsSync(prover)).toBe(true);
    expect(fs.existsSync(verifier)).toBe(true);
    expect(fs.statSync(prover).size).toBeGreaterThan(1000);
    expect(fs.statSync(verifier).size).toBeGreaterThan(100);
  });

  it('sets Preprod network id via midnight-js-network-id (config only)', () => {
    setNetworkId(PREPROD.networkId);
    expect(getNetworkId()).toBe('preprod');
  });
});
