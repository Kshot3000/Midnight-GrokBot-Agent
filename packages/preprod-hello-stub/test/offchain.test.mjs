import { describe, it, expect } from 'vitest';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import * as RT from '@midnight-ntwrk/compact-runtime';
import { HELLO_CONTRACT, HELLO_KEYS } from '../src/paths.mjs';
import { inspectHelloArtifacts } from '../src/check-artifacts.mjs';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { PREPROD, BRAND } from '../src/preprod-config.mjs';

// The compiled hello artifacts are gitignored — a fresh clone has none until
// `npm run compact:hello` runs (Compact CLI +0.31.1). Artifact-dependent
// tests SKIP with instructions in that state (same gate pattern as the
// escrow tests) instead of failing the whole suite from a beforeAll throw;
// tests that need no artifacts always run.
const artifacts = inspectHelloArtifacts();
const SKIP_MSG =
  'hello artifacts missing — run: npm run compact:hello (from repo root)';

describe('preprod-hello-stub (honest off-chain)', () => {
  it('loads Compact-generated Contract and increments greetings', async (ctx) => {
    if (!artifacts.ok) return ctx.skip(SKIP_MSG);
    const { Contract, ledger } = await import(pathToFileURL(HELLO_CONTRACT).href);
    const contract = new Contract({});
    const COIN = '0'.repeat(64);
    const ADDR = RT.sampleContractAddress();
    const ctor = contract.initialState(RT.createConstructorContext({}, COIN));
    const ctx0 = RT.createCircuitContext(ADDR, COIN, ctor.currentContractState, {});
    expect(ledger(ctx0.currentQueryContext.state).greetings).toBe(0n);
    const call = contract.impureCircuits.increment(ctx0);
    expect(ledger(call.context.currentQueryContext.state).greetings).toBe(1n);
    expect(call.proofData.publicTranscript.length).toBeGreaterThan(0);
  });

  it('rejects missing witnesses shape only when required (hello needs none)', async (ctx) => {
    if (!artifacts.ok) return ctx.skip(SKIP_MSG);
    const { Contract } = await import(pathToFileURL(HELLO_CONTRACT).href);
    expect(() => new Contract({})).not.toThrow();
  });

  it('has real prover/verifier keys on disk (not placeholders)', (ctx) => {
    if (!artifacts.ok) return ctx.skip(SKIP_MSG);
    const prover = `${HELLO_KEYS}/increment.prover`;
    const verifier = `${HELLO_KEYS}/increment.verifier`;
    expect(fs.existsSync(prover)).toBe(true);
    expect(fs.existsSync(verifier)).toBe(true);
    expect(fs.statSync(prover).size).toBeGreaterThan(1000);
    expect(fs.statSync(verifier).size).toBeGreaterThan(100);
  });
});

describe('preprod-hello-stub (no artifacts needed)', () => {
  it('sets Preprod network id via midnight-js-network-id (config only)', () => {
    setNetworkId(PREPROD.networkId);
    expect(getNetworkId()).toBe('preprod');
  });

  it('brand links point at the live NightDream site (nightdream.xyz)', () => {
    // nightdream.io is NXDOMAIN (see contracts/AUDIT-NOTES.md); the live
    // custom domain is nightdream.xyz. Guard the canonical BRAND constant
    // so the dead domain cannot creep back in.
    expect(BRAND.nightdream).toBe('https://nightdream.xyz');
    expect(BRAND.xUrl).toBe('https://x.com/kshot9000');
  });
});
